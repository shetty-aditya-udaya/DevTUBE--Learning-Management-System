from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import progress_service
from app.utils.responses import success_response, error_response

progress_bp = Blueprint("progress", __name__)


@progress_bp.route("", methods=["POST"])
@jwt_required()
def mark_complete():
    data = request.get_json(silent=True) or {}
    lesson_id = data.get("lesson_id")

    if not lesson_id:
        return error_response("lesson_id is required", 400)

    user_id = int(get_jwt_identity())

    try:
        progress = progress_service.mark_lesson_complete(user_id, int(lesson_id))
    except ValueError as e:
        return error_response(str(e), 400)

    return success_response({"progress": progress}, "Lesson marked as complete")


@progress_bp.route("/update", methods=["POST"])
@jwt_required()
def update_progress():
    data = request.get_json(silent=True) or {}
    lesson_id = data.get("lessonId") or data.get("lesson_id")
    progress_seconds = data.get("progress_seconds", 0)

    if not lesson_id:
        return error_response("lessonId is required", 400)

    user_id = int(get_jwt_identity())

    try:
        progress = progress_service.update_progress(user_id, int(lesson_id), int(progress_seconds))
    except ValueError as e:
        return error_response(str(e), 400)

    return success_response({"progress": progress}, "Progress saved")


@progress_bp.route("/<int:course_id>", methods=["GET"])
@jwt_required()
def get_progress(course_id):
    user_id = int(get_jwt_identity())

    try:
        data = progress_service.get_course_progress(user_id, course_id)
    except PermissionError as e:
        return error_response(str(e), 403)
    except ValueError as e:
        return error_response(str(e), 404)

    return success_response(data)
