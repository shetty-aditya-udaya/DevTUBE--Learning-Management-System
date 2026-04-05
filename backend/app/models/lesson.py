from app.extensions import db


class Lesson(db.Model):
    __tablename__ = "lessons"

    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey("sections.id"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    order_number = db.Column(db.Integer, nullable=False, default=1)
    youtube_url = db.Column(db.String(500), nullable=False)
    duration = db.Column(db.Integer, nullable=True)  # seconds

    # Relationships
    progress_records = db.relationship("Progress", backref="lesson", lazy="dynamic", cascade="all, delete-orphan")

    __table_args__ = (
        db.Index("ix_lesson_section_order", "section_id", "order_number"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "section_id": self.section_id,
            "title": self.title,
            "order_number": self.order_number,
            "youtube_url": self.youtube_url,
            "duration": self.duration,
        }
