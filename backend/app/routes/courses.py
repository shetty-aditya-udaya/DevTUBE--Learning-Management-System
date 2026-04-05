from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services import course_service
from app.utils.responses import success_response, error_response

courses_bp = Blueprint("courses", __name__)


@courses_bp.route("", methods=["GET"])
def get_all_courses():
    courses = course_service.get_all_courses()
    return success_response({"courses": courses, "count": len(courses)})


@courses_bp.route("/<int:course_id>", methods=["GET"])
def get_course(course_id):
    try:
        course = course_service.get_course_detail(course_id)
    except ValueError as e:
        return error_response(str(e), 404)
    return success_response({"course": course})


@courses_bp.route("", methods=["POST"])
@jwt_required()
def create_course():
    claims = get_jwt()
    role = claims.get("role")
    if role not in ("instructor", "admin"):
        return error_response("Only instructors can create courses", 403)

    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    description = data.get("description", "")
    thumbnail = data.get("thumbnail", "")
    category = data.get("category", "")

    if not title:
        return error_response("title is required", 400)

    instructor_id = int(get_jwt_identity())
    try:
        course = course_service.create_course(title, description, thumbnail, category, instructor_id)
    except Exception as e:
        return error_response(str(e), 500)

    return success_response({"course": course}, "Course created", 201)
