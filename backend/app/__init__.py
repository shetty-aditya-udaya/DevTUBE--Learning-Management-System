from flask import Flask
from flask_cors import CORS
from config import Config
from app.extensions import db, jwt, ma


def create_app(config_class=Config):
    flask_app = Flask(__name__)
    flask_app.config.from_object(config_class)
    # DB URI is now read from config.py → .env (DATABASE_URL)

    # Initialize extensions
    db.init_app(flask_app)
    jwt.init_app(flask_app)
    ma.init_app(flask_app)
    from app.extensions import bcrypt
    bcrypt.init_app(flask_app)
    from app.extensions import migrate
    migrate.init_app(flask_app, db)
    CORS(flask_app)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.courses import courses_bp
    from app.routes.enrollments import enrollments_bp
    from app.routes.lessons import lessons_bp
    from app.routes.progress import progress_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.community import community_bp
    from app.routes.ai import ai_bp

    flask_app.register_blueprint(auth_bp, url_prefix="/api/auth")
    flask_app.register_blueprint(courses_bp, url_prefix="/api/courses")
    flask_app.register_blueprint(enrollments_bp, url_prefix="/api/enrollments")
    flask_app.register_blueprint(lessons_bp, url_prefix="/api/lessons")
    flask_app.register_blueprint(progress_bp, url_prefix="/api/progress")
    flask_app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    flask_app.register_blueprint(community_bp, url_prefix="/api/community")
    flask_app.register_blueprint(ai_bp, url_prefix="/api/ai")

    # Register error handlers
    from app.utils.responses import error_response

    @flask_app.errorhandler(404)
    def not_found(e):
        return error_response("Resource not found", 404)

    @flask_app.errorhandler(405)
    def method_not_allowed(e):
        return error_response("Method not allowed", 405)

    @flask_app.errorhandler(500)
    def internal_error(e):
        return error_response("Internal server error", 500)

    # Diagnostic route
    @flask_app.route("/api/test-db")
    def test_db():
        try:
            from sqlalchemy import text
            db.session.execute(text("SELECT 1"))
            return {"status": "connected", "message": "Database connection successful!"}, 200
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500

    # Create tables (dev convenience — use Alembic in production)
    with flask_app.app_context():
        import app.models  # noqa: F401 – ensure models are loaded
        db.create_all()

        # ── AI Assistant: Build RAG index from live DB ──────────────────────
        import threading
        from app.services import ai_service

        def _warm_up_ai():
            """Run FAISS index build in background thread so server starts instantly."""
            try:
                ai_service.initialize(flask_app)
            except Exception as exc:
                import logging
                logging.getLogger("ai_service").error(f"[AI] Warm-up failed: {exc}")

        t = threading.Thread(target=_warm_up_ai, daemon=True, name="ai-warmup")
        t.start()

        # Log registered routes
        from flask import url_for
        import urllib.parse
        
        print("\n" + "="*50)
        print(" REGISTERED ROUTES ".center(50, "="))
        print("="*50)
        output = []
        for rule in flask_app.url_map.iter_rules():
            methods = ','.join(rule.methods)
            line = urllib.parse.unquote(f"{rule.endpoint:40s} {methods:30s} {rule}")
            output.append(line)
        for line in sorted(output):
            print(line)
        print("="*50 + "\n")

    return flask_app
