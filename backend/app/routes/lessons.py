from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.lesson import Lesson
from app.models.enrollment import Enrollment
from app.models.section import Section
from app.utils.responses import success_response, error_response

lessons_bp = Blueprint("lessons", __name__)


@lessons_bp.route("/<int:lesson_id>", methods=["GET"])
@jwt_required()
def get_lesson(lesson_id):
    user_id = int(get_jwt_identity())

    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return error_response("Lesson not found", 404)

    # Verify user is enrolled in the course that contains this lesson
    section = Section.query.get(lesson.section_id)
    enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=section.course_id).first()
    if not enrollment:
        return error_response("Not enrolled in this course", 403)

    return success_response({"lesson": lesson.to_dict()})
