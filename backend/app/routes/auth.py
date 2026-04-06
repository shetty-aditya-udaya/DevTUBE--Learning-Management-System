from flask import Blueprint, request
from app.services import auth_service
from app.utils.responses import success_response, error_response
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, get_jwt
from app.extensions import db
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json(silent=True) or {}
    logger.debug("Signup attempt: email=%s", data.get("email", ""))

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "student")

    if not name or not email or not password:
        return error_response("name, email, and password are required", 400)
    if len(password) < 6:
        return error_response("Password must be at least 6 characters", 400)

    try:
        user, tokens = auth_service.signup_user(name, email, password, role)
        logger.debug("Signup success: %s", email)
    except ValueError as e:
        logger.debug("Signup failed: %s", str(e))
        return error_response(str(e), 409)
    except Exception as e:
        logger.exception("Signup unexpected error")
        return error_response("Internal Server Error during signup", 500)

    return success_response({"user": user, **tokens}, "Account created", 201)


@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json(silent=True) or {}
    logger.debug("Login attempt: email=%s", data.get("email", ""))
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return error_response("email and password are required", 400)

    try:
        user, tokens = auth_service.login_user(email, password)
        logger.debug("Login success: %s", email)
    except ValueError as e:
        logger.debug("Login failed: %s", str(e))
        return error_response(str(e), 401)
    except Exception as e:
        logger.exception("Login unexpected error")
        return error_response("Internal Server Error during login", 500)

    return success_response({"user": user, **tokens}, "Login successful")


@auth_bp.route("/refresh", methods=["POST", "OPTIONS"])
@jwt_required(refresh=True, optional=True)
def refresh():
    if request.method == "OPTIONS":
        return "", 200
    
    # Check if this is an actual request with a token
    from flask_jwt_extended import get_jwt_identity
    identity = get_jwt_identity()
    if not identity:
        return error_response("Refresh token required", 401)
    claims = get_jwt()
    additional_claims = {"role": claims.get("role"), "name": claims.get("name")}
    access_token = create_access_token(identity=identity, additional_claims=additional_claims)
    return success_response({"access_token": access_token}, "Token refreshed")


@auth_bp.route("/me", methods=["GET", "OPTIONS"])
@jwt_required(optional=True)
def me():
    if request.method == "OPTIONS":
        return "", 200
        
    identity = get_jwt_identity()
    if not identity:
        return error_response("Authorization required", 401)
    from app.models.user import User
    try:
        user_id = int(get_jwt_identity())
    except (TypeError, ValueError):
        return error_response("Invalid token identity", 422)
    user = db.session.get(User, user_id)
    if not user:
        return error_response("User not found", 404)
    return success_response({"user": user.to_dict()})
