from app.extensions import db
from datetime import datetime


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    thumbnail = db.Column(db.String(500), nullable=True)
    category = db.Column(db.String(100), nullable=True, index=True)
    instructor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    rating = db.Column(db.Float, default=0.0)
    duration = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    sections = db.relationship(
        "Section",
        backref="course",
        lazy="dynamic",
        order_by="Section.order_number",
        cascade="all, delete-orphan",
    )
    enrollments = db.relationship("Enrollment", backref="course", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "thumbnail": self.thumbnail,
            "category": self.category,
            "instructor_id": self.instructor_id,
            "instructor_name": self.instructor.name if self.instructor else None,
            "instructor_avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={self.instructor.name}" if self.instructor else None,
            "rating": self.rating or 0.0,
            "duration": self.duration,
            "created_at": self.created_at.isoformat(),
        }
