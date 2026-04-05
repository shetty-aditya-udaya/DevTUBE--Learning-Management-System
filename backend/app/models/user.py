from app.extensions import db, bcrypt
from werkzeug.security import check_password_hash as werkzeug_check_hash
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.Enum("student", "instructor", "admin"), nullable=False, default="student")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    courses = db.relationship("Course", backref="instructor", lazy="dynamic")
    enrollments = db.relationship("Enrollment", backref="user", lazy="dynamic")
    progress = db.relationship("Progress", backref="user", lazy="dynamic")

    def set_password(self, password: str):
        # Always use bcrypt for new passwords
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        # 1. Try Bcrypt check first (Modern)
        try:
            # If it's a bcrypt hash ($2a$, $2b$, etc.), this will return True/False correctly.
            if bcrypt.check_password_hash(self.password_hash, password):
                return True
        except (ValueError, TypeError):
            # Not a bcrypt hash format, proceeding to legacy fallback
            pass

        # 2. Fallback to Werkzeug check for legacy hashes (scrypt: or pbkdf2: formats)
        if self.password_hash.startswith(("scrypt:", "pbkdf2:")):
            return werkzeug_check_hash(self.password_hash, password)

        # 3. Last chance: if bcrypt check returned False, but we didn't throw (some versions do this)
        # and it's NOT a legacy hash, then it's just a wrong password for a bcrypt user.
        return False

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat(),
        }
