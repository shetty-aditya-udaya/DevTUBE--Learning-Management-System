from app.models.user import User
from app.extensions import db
from flask_jwt_extended import create_access_token, create_refresh_token
import logging

logger = logging.getLogger(__name__)


def signup_user(name: str, email: str, password: str, role: str = "student"):
    """
    Creates a new user. Returns (user_dict, access_token, refresh_token) or raises ValueError.
    """
    email = email.lower().strip()
    if User.query.filter_by(email=email).first():
        logger.warning("Signup failed: Email already exists - %s", email)
        raise ValueError("Email already registered")

    if role not in ("student", "instructor", "admin"):
        raise ValueError("Invalid role selected")

    user = User(name=name, email=email, role=role)
    user.set_password(password)

    try:
        logger.info("Normalizing email: %s", email)
        logger.debug("Sign-up attempt for: %s", name)
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        logger.error("DB Error during signup: %s", str(e))
        db.session.rollback()
        raise e

    tokens = _generate_tokens(user)
    return user.to_dict(), tokens


def login_user(email: str, password: str):
    """
    Validates credentials. Returns (user_dict, access_token, refresh_token) or raises ValueError.
    """
    email = email.lower().strip()
    logger.info("Login attempt - Input Email: %s", email)

    user = User.query.filter_by(email=email).first()

    if not user:
        logger.warning("Login failed: User not found - %s", email)
        raise ValueError("Invalid email or password")

    logger.debug("Fetched User ID: %s, Email: %s", user.id, user.email)
    logger.debug("Password hash present: %s", bool(user.password_hash))

    if not user.check_password(password):
        logger.warning("Login failed: Password mismatch for user - %s", email)
        raise ValueError("Invalid email or password")

    logger.info("Login successful for user: %s", email)
    tokens = _generate_tokens(user)
    return user.to_dict(), tokens


def _generate_tokens(user: User):
    additional_claims = {"role": user.role, "name": user.name}
    access_token = create_access_token(
        identity=str(user.id), additional_claims=additional_claims
    )
    refresh_token = create_refresh_token(
        identity=str(user.id), additional_claims=additional_claims
    )
    return {"access_token": access_token, "refresh_token": refresh_token}
