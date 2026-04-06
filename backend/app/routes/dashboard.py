from flask import Blueprint, request
from app.utils.responses import success_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import dashboard_service
import logging

logger = logging.getLogger(__name__)

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/", methods=["GET", "OPTIONS"])
@dashboard_bp.route("", methods=["GET", "OPTIONS"])
@jwt_required(optional=True)
def get_dashboard():
    if request.method == "OPTIONS":
        return "", 200
    
    user_id = get_jwt_identity()
    if not user_id:
        from app.utils.responses import error_response
        return error_response("Unauthorized", 401)
        
    user_id = int(user_id)
    data = dashboard_service.get_dashboard_data(user_id)
    logger.debug("Dashboard loaded for user_id=%d", user_id)
    return success_response(data)

@dashboard_bp.route("/mentors", methods=["GET", "OPTIONS"])
@jwt_required(optional=True)
def get_mentors():
    if request.method == "OPTIONS":
        return "", 200
        
    user_id = get_jwt_identity()
    if not user_id:
        from app.utils.responses import error_response
        return error_response("Unauthorized", 401)
        
    user_id = int(user_id)
    mentors = dashboard_service.get_mentors_data(user_id)
    logger.debug("Mentors loaded for user_id=%d: count=%d", user_id, len(mentors))
    return success_response(mentors)
