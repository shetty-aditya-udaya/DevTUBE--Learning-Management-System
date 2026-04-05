from app.models.progress import Progress
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.section import Section
from app.models.lesson import Lesson
from app.extensions import db
from sqlalchemy.exc import IntegrityError
from datetime import datetime


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_all_lessons_for_course(course_id: int):
    """
    Returns a flat ordered list of Lesson objects across all sections in the course.
    Order: section.order_number ASC, lesson.order_number ASC
    """
    return (
        db.session.query(Lesson)
        .join(Section, Lesson.section_id == Section.id)
        .filter(Section.course_id == course_id)
        .order_by(Section.order_number, Lesson.order_number)
        .all()
    )


def _get_completed_lesson_ids(user_id: int, lesson_ids: list) -> set:
    """Returns the set of lesson IDs that the user has completed."""
    records = (
        Progress.query.filter(
            Progress.user_id == user_id,
            Progress.lesson_id.in_(lesson_ids),
            Progress.completed == True,  # noqa: E712
        ).all()
    )
    return {r.lesson_id for r in records}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def mark_lesson_complete(user_id: int, lesson_id: int):
    """
    Marks a lesson as complete for the user.
    Creates the progress record if it doesn't exist yet.
    Returns the progress dict.
    """
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        raise ValueError("Lesson not found")

    # Upsert progress record
    record = Progress.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    if not record:
        record = Progress(user_id=user_id, lesson_id=lesson_id)
        db.session.add(record)

    record.mark_complete()

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ValueError("Could not save progress")

    return record.to_dict()


def update_progress(user_id: int, lesson_id: int, progress_seconds: int):
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        raise ValueError("Lesson not found")

    record = Progress.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    if not record:
        record = Progress(user_id=user_id, lesson_id=lesson_id)
        db.session.add(record)

    record.progress_seconds = progress_seconds
    record.last_watched = datetime.utcnow()

    # Only mark incomplete if the lesson hasn't been completed yet
    # Never de-complete a lesson a user already finished
    if not record.completed:
        # If watched >= 90% of the lesson duration, mark as complete
        if lesson.duration and lesson.duration > 0 and progress_seconds >= (lesson.duration * 0.9):
            record.mark_complete()

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ValueError("Could not update video progress")


    return {
        "id": record.id,
        "completed": record.completed,
        "progress_seconds": record.progress_seconds,
        "last_watched": record.last_watched.isoformat() if record.last_watched else None
    }



def get_course_progress(user_id: int, course_id: int):
    """
    Returns full progress info for the user in a course:
    - per-lesson locked/unlocked/completed status
    - overall progress percentage
    - resume lesson (first incomplete unlocked lesson)

    Unlock logic:
    - lesson[0] is always unlocked
    - lesson[N] is unlocked if lesson[N-1] is completed
    """
    # Verify enrollment
    enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
    if not enrollment:
        raise PermissionError("Not enrolled in this course")

    all_lessons = _get_all_lessons_for_course(course_id)
    if not all_lessons:
        return {
            "course_id": course_id,
            "total_lessons": 0,
            "completed_lessons": 0,
            "progress_percent": 0.0,
            "resume_lesson_id": None,
            "lessons": [],
        }

    lesson_ids = [l.id for l in all_lessons]
    completed_ids = _get_completed_lesson_ids(user_id, lesson_ids)

    lessons_data = []
    resume_lesson_id = None

    for index, lesson in enumerate(all_lessons):
        is_first = index == 0
        prev_lesson = all_lessons[index - 1] if index > 0 else None

        is_unlocked = is_first or (prev_lesson is not None and prev_lesson.id in completed_ids)
        is_completed = lesson.id in completed_ids

        if is_unlocked and not is_completed and resume_lesson_id is None:
            resume_lesson_id = lesson.id

        lessons_data.append(
            {
                **lesson.to_dict(),
                "is_unlocked": is_unlocked,
                "is_completed": is_completed,
            }
        )

    total = len(all_lessons)
    completed_count = len(completed_ids)
    progress_percent = round((completed_count / total) * 100, 2) if total > 0 else 0.0

    # If all complete, resume the last lesson
    if resume_lesson_id is None and all_lessons:
        resume_lesson_id = all_lessons[-1].id

    return {
        "course_id": course_id,
        "total_lessons": total,
        "completed_lessons": completed_count,
        "progress_percent": progress_percent,
        "resume_lesson_id": resume_lesson_id,
        "lessons": lessons_data,
    }
