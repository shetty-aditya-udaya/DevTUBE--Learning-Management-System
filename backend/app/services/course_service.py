from app.models.course import Course
from app.models.section import Section
from app.models.lesson import Lesson
from app.extensions import db


def get_all_courses():
    courses = Course.query.order_by(Course.created_at.desc()).all()
    return [c.to_dict() for c in courses]


def get_course_detail(course_id: int):
    course = Course.query.get(course_id)
    if not course:
        raise ValueError("Course not found")

    sections_data = []
    for section in course.sections.order_by(Section.order_number):
        lessons_data = [l.to_dict() for l in section.lessons.order_by(Lesson.order_number)]
        s = section.to_dict()
        s["lessons"] = lessons_data
        sections_data.append(s)

    data = course.to_dict()
    data["sections"] = sections_data
    return data


def create_course(title: str, description: str, thumbnail: str, category: str, instructor_id: int):
    course = Course(
        title=title,
        description=description,
        thumbnail=thumbnail,
        category=category,
        instructor_id=instructor_id,
    )
    try:
        db.session.add(course)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise
    return course.to_dict()
