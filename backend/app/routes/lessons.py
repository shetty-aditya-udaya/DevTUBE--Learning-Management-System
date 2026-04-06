from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.lesson import Lesson
# ... (rest of imports)
from app.utils.responses import success_response, error_response

lessons_bp = Blueprint("lessons", __name__)


@lessons_bp.route("/<int:lesson_id>", methods=["GET", "OPTIONS"])
@jwt_required(optional=True)
def get_lesson(lesson_id):
    if request.method == "OPTIONS":
        return "", 200
        
    identity = get_jwt_identity()
    if not identity:
        return error_response("Authorization required", 401)
    
    user_id = int(identity)

    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return error_response("Lesson not found", 404)

    # Verify user is enrolled in the course that contains this lesson
    section = Section.query.get(lesson.section_id)
    enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=section.course_id).first()
    if not enrollment:
        return error_response("Not enrolled in this course", 403)

    return success_response({"lesson": lesson.to_dict()})
