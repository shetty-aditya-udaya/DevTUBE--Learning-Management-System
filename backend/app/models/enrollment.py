from app.extensions import db
from datetime import datetime


class Enrollment(db.Model):
    __tablename__ = "enrollments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False, index=True)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Enforce uniqueness: one enrollment per user per course
    __table_args__ = (
        db.UniqueConstraint("user_id", "course_id", name="uq_enrollment_user_course"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "enrolled_at": self.enrolled_at.isoformat(),
        }
