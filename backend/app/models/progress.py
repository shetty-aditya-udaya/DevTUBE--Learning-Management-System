from app.extensions import db
from datetime import datetime


class Progress(db.Model):
    __tablename__ = "progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False, index=True)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    progress_seconds = db.Column(db.Integer, default=0, nullable=False)
    last_watched = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    # One progress record per user per lesson
    __table_args__ = (
        db.UniqueConstraint("user_id", "lesson_id", name="uq_progress_user_lesson"),
        db.Index("ix_progress_user_lesson", "user_id", "lesson_id"),
    )

    def mark_complete(self):
        self.completed = True
        self.completed_at = datetime.utcnow()

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "lesson_id": self.lesson_id,
            "completed": self.completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
