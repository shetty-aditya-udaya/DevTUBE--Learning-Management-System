from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import enrollment_service
from app.utils.responses import success_response, error_response

enrollments_bp = Blueprint("enrollments", __name__)


@enrollments_bp.route("", methods=["POST", "OPTIONS"])
@jwt_required(optional=True)
def enroll():
    if request.method == "OPTIONS":
        return "", 200
        
    identity = get_jwt_identity()
    if not identity:
        return error_response("Authorization required", 401)
    data = request.get_json(silent=True) or {}
    course_id = data.get("course_id")

    if not course_id:
        return error_response("course_id is required", 400)

    user_id = int(get_jwt_identity())

    try:
        enrollment = enrollment_service.enroll_student(user_id, int(course_id))
    except ValueError as e:
        return error_response(str(e), 409)

    return success_response({"enrollment": enrollment}, "Enrolled successfully", 201)


@enrollments_bp.route("/me", methods=["GET", "OPTIONS"])
@jwt_required(optional=True)
def my_enrollments():
    if request.method == "OPTIONS":
        return "", 200
        
    identity = get_jwt_identity()
    if not identity:
        return error_response("Authorization required", 401)
    user_id = int(get_jwt_identity())
    enrollments = enrollment_service.get_user_enrollments(user_id)
    return success_response({"enrollments": enrollments, "count": len(enrollments)})
