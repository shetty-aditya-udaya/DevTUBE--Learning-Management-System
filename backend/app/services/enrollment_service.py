from app.models.enrollment import Enrollment
from app.models.course import Course
from app.extensions import db
from sqlalchemy.exc import IntegrityError


def enroll_student(user_id: int, course_id: int):
    if not Course.query.get(course_id):
        raise ValueError("Course not found")

    try:
        enrollment = Enrollment(user_id=user_id, course_id=course_id)
        db.session.add(enrollment)
        db.session.commit()
        return enrollment.to_dict()
    except IntegrityError:
        db.session.rollback()
        raise ValueError("Already enrolled in this course")


def get_user_enrollments(user_id: int):
    enrollments = Enrollment.query.filter_by(user_id=user_id).all()
    return [e.to_dict() for e in enrollments]
