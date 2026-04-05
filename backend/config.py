import os
import warnings
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# ── Weak-key guard ──────────────────────────────────────────────────────────
_WEAK_KEYS = {"devtube-super-secret-key-change-in-prod", "devtube-jwt-secret-change-in-prod"}
_secret  = os.getenv("SECRET_KEY", "")
_jwt_key = os.getenv("JWT_SECRET_KEY", "")
if _secret in _WEAK_KEYS or len(_secret) < 24:
    warnings.warn("[SECURITY] SECRET_KEY is weak or missing. Set a strong value in .env before deploying!", stacklevel=2)
if _jwt_key in _WEAK_KEYS or len(_jwt_key) < 24:
    warnings.warn("[SECURITY] JWT_SECRET_KEY is weak or missing. Set a strong value in .env before deploying!", stacklevel=2)

# ── Aiven MySQL SSL ──────────────────────────────────────────────────────────
_db_url = os.getenv("DATABASE_URL", "")
_is_aiven = "aivencloud.com" in _db_url
_engine_options = {
    "pool_pre_ping":  True,          # Drop stale connections before use
    "pool_recycle":   280,           # Recycle before MySQL 8-hour timeout
    "pool_size":      5,             # Base pool connections
    "max_overflow":   10,            # Burst capacity
    "pool_timeout":   30,            # Wait max 30s for a connection
}
if _is_aiven:
    # Aiven requires SSL — enable it without a local CA cert bundle
    _engine_options["connect_args"] = {
        "ssl": {"ssl_mode": "REQUIRED"}
    }


class Config:
    # ── Flask ────────────────────────────────────────────────────────────────
    SECRET_KEY = os.getenv("SECRET_KEY", "devtube-super-secret-key-change-in-prod")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

    # ── Database ─────────────────────────────────────────────────────────────
    SQLALCHEMY_DATABASE_URI = _db_url or "sqlite:///devtube_final.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = _engine_options

    # ── JWT ──────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "devtube-jwt-secret-change-in-prod")
    JWT_ACCESS_TOKEN_EXPIRES  = timedelta(seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES",  3600)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000)))

    # ── CORS ─────────────────────────────────────────────────────────────────
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
