from flask import Blueprint, request
from app.services import ai_service
from app.utils.responses import success_response, error_response

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/query", methods=["POST"])
def query():
    """
    POST /api/ai/query
    Body: { "query": "user question" }
    Returns: { "answer": "...", "sources": [...] }
    """
    data = request.get_json(silent=True) or {}
    user_query = data.get("query", "").strip()

    if not user_query:
        return error_response("'query' field is required", 400)

    if len(user_query) > 500:
        return error_response("Query is too long (max 500 characters)", 400)

    try:
        result = ai_service.query(user_query)
        return success_response(result)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"[AI Route] Unhandled error: {e}")
        return error_response("AI assistant encountered an error. Please try again.", 500)


@ai_bp.route("/status", methods=["GET"])
def status():
    """Health-check: is the AI index ready?"""
    ready = ai_service._faiss_index is not None
    return success_response({
        "ready": ready,
        "docs": len(ai_service._doc_store),
        "llm": "gemini-2.0-flash" if ai_service._gemini_model else "retrieval-only",
    })
