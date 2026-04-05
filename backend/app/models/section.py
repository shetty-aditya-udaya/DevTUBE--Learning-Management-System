from app.extensions import db


class Section(db.Model):
    __tablename__ = "sections"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    order_number = db.Column(db.Integer, nullable=False, default=1)

    # Relationships
    lessons = db.relationship(
        "Lesson",
        backref="section",
        lazy="dynamic",
        order_by="Lesson.order_number",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        db.Index("ix_section_course_order", "course_id", "order_number"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "order_number": self.order_number,
        }
