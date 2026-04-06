from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services import course_service
from app.utils.responses import success_response, error_response

courses_bp = Blueprint("courses", __name__)


@courses_bp.route("", methods=["GET", "OPTIONS"])
def get_all_courses():
    if request.method == "OPTIONS":
        return "", 200
    courses = course_service.get_all_courses()
    return success_response({"courses": courses, "count": len(courses)})


@courses_bp.route("/<int:course_id>", methods=["GET", "OPTIONS"])
def get_course(course_id):
    if request.method == "OPTIONS":
        return "", 200
    try:
        course = course_service.get_course_detail(course_id)
    except ValueError as e:
        return error_response(str(e), 404)
    return success_response({"course": course})


@courses_bp.route("", methods=["POST", "OPTIONS"])
@jwt_required(optional=True)
def create_course():
    if request.method == "OPTIONS":
        return "", 200
        
    identity = get_jwt_identity()
    if not identity:
        return error_response("Authorization required", 401)
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
