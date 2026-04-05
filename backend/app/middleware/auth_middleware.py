from functools import wraps
from flask import request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.utils.responses import error_response


def jwt_required_custom(fn):
    """Decorator: requires a valid JWT access token."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception as e:
            return error_response(str(e), 401)
        return fn(*args, **kwargs)
    return wrapper


def roles_required(*roles):
    """Decorator: restricts endpoint to users with the given role(s)."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                user_role = claims.get("role")
                if user_role not in roles:
                    return error_response("Forbidden: insufficient permissions", 403)
            except Exception as e:
                return error_response(str(e), 401)
            return fn(*args, **kwargs)
        return wrapper
    return decorator
