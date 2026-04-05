from flask import Blueprint
from app.utils.responses import success_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import dashboard_service
import logging

logger = logging.getLogger(__name__)

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/", methods=["GET", "OPTIONS"])
@dashboard_bp.route("", methods=["GET", "OPTIONS"])
@jwt_required()
def get_dashboard():
    user_id = int(get_jwt_identity())
    data = dashboard_service.get_dashboard_data(user_id)
    logger.debug("Dashboard loaded for user_id=%d", user_id)
    return success_response(data)

@dashboard_bp.route("/mentors", methods=["GET", "OPTIONS"])
@jwt_required()
def get_mentors():
    user_id = int(get_jwt_identity())
    mentors = dashboard_service.get_mentors_data(user_id)
    logger.debug("Mentors loaded for user_id=%d: count=%d", user_id, len(mentors))
    return success_response(mentors)
