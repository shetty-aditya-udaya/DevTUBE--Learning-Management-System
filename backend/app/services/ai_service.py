"""
DevTUBE AI Service — RAG Backend
=================================
Pipeline:
  1. At startup  → pull live data from DB → build text docs
  2. At startup  → embed all docs with MiniLM-L6-v2 → store in FAISS
  3. Per query   → embed query → retrieve top-k docs
  4. Guard phase → reject off-topic queries (similarity threshold + keywords)
  5. LLM phase   → Gemini generates grounded answer
  6. Return      → { answer, sources }
"""

import os
import logging
import threading
import numpy as np
from typing import Optional
from flask import current_app

logger = logging.getLogger(__name__)

_init_lock = threading.Lock()

# ── Lazy-loaded globals (initialised once) ────────────────────────────────────
_embedder        = None   # SentenceTransformer model
_faiss_index     = None   # faiss.IndexFlatIP
_doc_store: list = []     # [{ "text": str, "title": str, "type": str }]
_gemini_model    = None   # google.generativeai GenerativeModel


# ── LMS keywords for fast pre-filter ─────────────────────────────────────────
_LMS_KEYWORDS = {
    "course", "courses", "lesson", "lessons", "module", "modules",
    "instructor", "instructors", "teacher", "tutor", "enroll", "enrollment",
    "learn", "learning", "path", "progress", "category", "categories",
    "devtube", "video", "tutorial", "rating", "duration", "beginner",
    "intermediate", "advanced", "web", "python", "react", "javascript",
    "html", "css", "node", "data science", "machine learning", "ai",
    "quiz", "assignment", "certificate", "section", "dashboard",
    "recommend", "best", "top", "popular", "featured", "price", "free",
}

# ── Two-tier similarity thresholds ───────────────────────────────────────────────
# Tier 1: query has LMS keyword  → very lenient score floor (avoids blocking valid queries)
_THRESHOLD_WITH_KEYWORD    = 0.20
# Tier 2: query has NO LMS keyword → strict score floor (blocks generic chat)
_THRESHOLD_WITHOUT_KEYWORD = 0.44

# Hard-blocked topics — rejected regardless of score or keyword
_BLOCKED_TOPICS = {
    "weather", "temperature", "forecast", "rain", "sunny", "humidity",
    "joke", "funny", "laugh", "meme",
    "recipe", "cook", "food", "eat", "restaurant",
    "sport", "cricket", "football", "soccer", "tennis", "basketball",
    "movie", "film", "actor", "actress", "celebrity", "bollywood",
    "stock", "crypto", "bitcoin", "invest", "market", "trading",
    "news", "politics", "election", "president", "government",
    "calculus", "algebra", "physics", "chemistry",
    "translate", "translation",
}

# ── Refusal message ───────────────────────────────────────────────────────────
_REFUSAL = (
    "I can only help with DevTUBE-related questions like courses, "
    "instructors, or learning paths. Please ask me something about "
    "the DevTUBE platform! 🎓"
)


# ─────────────────────────────────────────────────────────────────────────────
# 1. DATA EXTRACTION
# ─────────────────────────────────────────────────────────────────────────────

def _build_documents(app) -> list[dict]:
    """Pull live data from the database and convert to text documents."""
    docs = []

    with app.app_context():
        try:
            from app.models.course  import Course
            from app.models.user    import User
            from app.models.lesson  import Lesson
            from app.models.section import Section

            # ── Courses ──────────────────────────────────────────────────────
            courses = Course.query.all()
            for c in courses:
                instructor_name = c.instructor.name if c.instructor else "Unknown"
                text = (
                    f"Course: {c.title}. "
                    f"Category: {c.category or 'General'}. "
                    f"Instructor: {instructor_name}. "
                    f"Rating: {c.rating or 0.0}/5. "
                    f"Duration: {c.duration or 'N/A'}. "
                    f"Description: {c.description or 'No description available.'}"
                )
                docs.append({"text": text, "title": c.title, "type": "course"})

                # ── Sections & Lessons for this course ───────────────────────
                sections = Section.query.filter_by(course_id=c.id).all()
                lesson_titles = []
                for sec in sections:
                    lessons = Lesson.query.filter_by(section_id=sec.id).all()
                    lesson_titles += [l.title for l in lessons]

                if lesson_titles:
                    lesson_text = (
                        f"Lessons in '{c.title}': "
                        + ", ".join(lesson_titles[:20])
                        + (f" ... and {len(lesson_titles) - 20} more" if len(lesson_titles) > 20 else ".")
                    )
                    docs.append({
                        "text": lesson_text,
                        "title": f"{c.title} — Lessons",
                        "type": "lessons",
                    })

            # ── Instructors ───────────────────────────────────────────────────
            instructors = User.query.filter_by(role="instructor").all()
            for inst in instructors:
                their_courses = Course.query.filter_by(instructor_id=inst.id).all()
                course_names  = [c.title for c in their_courses]
                text = (
                    f"Instructor: {inst.name}. "
                    f"Email: {inst.email}. "
                    f"Teaches: {', '.join(course_names) if course_names else 'No courses yet'}."
                )
                docs.append({"text": text, "title": inst.name, "type": "instructor"})

            # ── Platform overview ─────────────────────────────────────────────
            docs.append({
                "text": (
                    f"DevTUBE is an online Learning Management System (LMS) "
                    f"with {len(courses)} courses across multiple categories. "
                    f"It features {len(instructors)} instructors. "
                    "Students can enroll in courses, track their progress, and learn via video lessons."
                ),
                "title": "DevTUBE Platform Overview",
                "type": "platform",
            })

            logger.info(f"[AI] Built {len(docs)} documents from live DB")
        except Exception as e:
            logger.error(f"[AI] Failed to build documents: {e}")
            # Minimal fallback so the service still starts
            docs.append({
                "text": "DevTUBE is an online learning platform with courses and instructors.",
                "title": "DevTUBE",
                "type": "platform",
            })

    return docs


# ─────────────────────────────────────────────────────────────────────────────
# 2. EMBEDDING + FAISS INDEX
# ─────────────────────────────────────────────────────────────────────────────

def _get_embedder():
    global _embedder
    if _embedder is None:
        from sentence_transformers import SentenceTransformer
        logger.info("[AI] Loading MiniLM-L6-v2 embedding model …")
        _embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        logger.info("[AI] Embedding model loaded ✓")
    return _embedder


def _build_index(docs: list[dict]):
    """Embed all docs and build a FAISS inner-product index (cosine sim via L2-normalised vecs)."""
    import faiss

    embedder = _get_embedder()
    texts = [d["text"] for d in docs]
    vecs  = embedder.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    vecs  = np.array(vecs, dtype="float32")

    dim   = vecs.shape[1]
    index = faiss.IndexFlatIP(dim)   # Inner-product on normalized vecs = cosine similarity
    index.add(vecs)
    logger.info(f"[AI] FAISS index built — {index.ntotal} vectors, dim={dim}")
    return index


# ─────────────────────────────────────────────────────────────────────────────
# 3. LAZY INITIALISATION (called on first use inside a request handler)
# ─────────────────────────────────────────────────────────────────────────────

def _ensure_initialized():
    """Build the document store and FAISS index inside the active Flask app context."""
    global _faiss_index, _doc_store, _gemini_model

    # Fast path
    if _faiss_index is not None and _doc_store:
        return

    with _init_lock:
        if _faiss_index is not None and _doc_store:
            return
            
        logger.info("[AI] Lazy loading AI models and FAISS index on first request...")
        
        try:
            # We are inside a request, current_app proxy resolves to real app
            app = current_app._get_current_object()
            
            # Documents
            _doc_store   = _build_documents(app)
            _faiss_index = _build_index(_doc_store)

            # Gemini client
            api_key = os.getenv("GEMINI_API_KEY", "")
            if api_key and api_key != "your_gemini_api_key_here":
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                _gemini_model = genai.GenerativeModel("models/gemini-2.0-flash")
                logger.info("[AI] Gemini client ready (models/gemini-2.0-flash) ✓")
            else:
                logger.warning("[AI] GEMINI_API_KEY not set — AI will run in retrieval-only mode.")
                
        except Exception as e:
            logger.error(f"[AI] Failed lazy initialization: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# 4. RETRIEVAL
# ─────────────────────────────────────────────────────────────────────────────

def _retrieve(query: str, top_k: int = 5) -> tuple[list[dict], float]:
    """Return (top_k docs, best_similarity_score)."""
    embedder = _get_embedder()
    q_vec = embedder.encode([query], normalize_embeddings=True, show_progress_bar=False)
    q_vec = np.array(q_vec, dtype="float32")

    scores, indices = _faiss_index.search(q_vec, top_k)
    results = []
    best_score = float(scores[0][0]) if len(scores[0]) > 0 else 0.0

    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(_doc_store):
            continue
        results.append({**_doc_store[idx], "score": float(score)})

    return results, best_score


# ─────────────────────────────────────────────────────────────────────────────
# 5. RELEVANCE GUARD
# ─────────────────────────────────────────────────────────────────────────────

def _is_relevant(query: str, best_score: float) -> bool:
    """
    Two-tier relevance gate:
      - Hard-blocked topics    → always False
      - Has LMS keyword        → pass if score >= 0.20  (lenient: covers all real LMS queries)
      - No LMS keyword         → pass if score >= 0.44  (strict: blocks generic conversation)
    """
    query_lower = query.lower()

    # Hard block: clearly off-topic topics no matter the score
    if any(blocked in query_lower for blocked in _BLOCKED_TOPICS):
        return False

    has_keyword = any(kw in query_lower for kw in _LMS_KEYWORDS)

    if has_keyword:
        # LMS keyword present → only need a minimal similarity floor
        return best_score >= _THRESHOLD_WITH_KEYWORD
    else:
        # No LMS keyword → require high semantic similarity to LMS content
        return best_score >= _THRESHOLD_WITHOUT_KEYWORD


# ─────────────────────────────────────────────────────────────────────────────
# 6. LLM GENERATION
# ─────────────────────────────────────────────────────────────────────────────

def _generate_answer(query: str, context_docs: list[dict]) -> str:
    """
    Ask Gemini to answer the query using only the retrieved context.
    Falls back to a clean text answer if Gemini is unavailable.
    """
    context_text = "\n\n".join(
        f"[{d['type'].upper()}] {d['title']}:\n{d['text']}"
        for d in context_docs
    )

    if _gemini_model is not None:
        prompt = f"""You are the DevTUBE AI Assistant — a friendly, knowledgeable guide for the DevTUBE online learning platform.

STRICT RULES:
1. ONLY answer using the context provided below. Do NOT use any outside knowledge.
2. If the answer cannot be found in the context, say: "I don't have enough information about that in our DevTUBE database right now."
3. Never answer questions unrelated to DevTUBE courses, instructors, or learning.
4. Be concise, helpful, and use emojis sparingly to be friendly.
5. When mentioning courses or instructors, be specific with names and details.

DEVTUBE CONTEXT:
{context_text}

USER QUESTION:
{query}

Provide a helpful, accurate answer based solely on the context above:"""

        try:
            response = _gemini_model.generate_content(prompt)
            if response.candidates and len(response.candidates) > 0:
                candidate = response.candidates[0]
                if candidate.content.parts:
                    return response.text.strip()
                else:
                    logger.warning(f"[AI] Gemini response blocked or empty. Reason: {candidate.finish_reason}")
            else:
                logger.warning(f"[AI] Gemini returned no candidates. Feedback: {response.prompt_feedback}")
        except Exception as e:
            logger.error(f"[AI] Gemini generation error: {type(e).__name__}: {e}")

    # ── Retrieval-only fallback (no LLM) ─────────────────────────────────────
    top = context_docs[0]
    return (
        f"Based on DevTUBE data — **{top['title']}**: "
        f"{top['text'][:400]}{'...' if len(top['text']) > 400 else ''}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# 7. PUBLIC ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

def query(user_query: str) -> dict:
    """
    Main RAG pipeline. Returns:
      { "answer": str, "sources": [{ "title": str, "type": str }] }
    """
    # Lazy initialisation of heavy AI models and data stores
    _ensure_initialized()

    if not _faiss_index or not _doc_store:
        return {
            "answer": "The AI assistant is temporarily unavailable (memory constrained). Please try again in a moment! ⚡",
            "sources": [],
        }

    q = user_query.strip()
    if not q:
        return {"answer": "Please enter a question!", "sources": []}

    # Retrieve
    results, best_score = _retrieve(q, top_k=5)

    # Guard
    if not _is_relevant(q, best_score):
        return {"answer": _REFUSAL, "sources": []}

    # Generate
    answer  = _generate_answer(q, results)
    sources = [{"title": r["title"], "type": r["type"]} for r in results[:3]]

    return {"answer": answer, "sources": sources}
