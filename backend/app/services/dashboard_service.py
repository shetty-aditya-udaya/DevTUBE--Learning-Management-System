from datetime import datetime, timedelta
import logging
from sqlalchemy import func, case
from app.extensions import db
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.section import Section
from app.models.enrollment import Enrollment
from app.models.progress import Progress
from app.models.user import User

logger = logging.getLogger(__name__)

def get_dashboard_data(user_id: int):
    # 1. Enrolled Courses — single aggregation query (fixes N+1)
    results = (
        db.session.query(
            Course,
            func.count(Lesson.id.distinct()).label("total_lessons"),
            func.sum(
                case((Progress.completed == True, 1), else_=0)
            ).label("completed_lessons"),
        )
        .join(Enrollment, Enrollment.course_id == Course.id)
        .join(Section, Section.course_id == Course.id)
        .join(Lesson, Lesson.section_id == Section.id)
        .outerjoin(
            Progress,
            (Progress.lesson_id == Lesson.id) & (Progress.user_id == user_id),
        )
        .filter(Enrollment.user_id == user_id)
        .group_by(Course.id)
        .all()
    )

    enrolled_courses = []
    for course, total_lessons, completed_lessons in results:
        total = total_lessons or 0
        completed = int(completed_lessons or 0)
        progress_percentage = int((completed / total) * 100) if total > 0 else 0
        enrolled_courses.append({
            "id": course.id,
            "title": course.title,
            "thumbnail": course.thumbnail,
            "instructor": course.instructor.name if course.instructor else "Unknown",
            "progress": progress_percentage,
            "total_lessons": total,
            "completed_lessons": completed,
        })

    # 2. Continue Watching (lessons started but not completed)
    continue_watching = []
    in_progress = (
        db.session.query(Progress, Lesson, Section, Course, User)
        .select_from(Progress)
        .join(Lesson, Progress.lesson_id == Lesson.id)
        .join(Section, Lesson.section_id == Section.id)
        .join(Course, Section.course_id == Course.id)
        .join(User, Course.instructor_id == User.id)
        .filter(
            Progress.user_id == user_id,
            Progress.completed == False,
            Progress.progress_seconds > 0,
        )
        .order_by(Progress.last_watched.desc())
        .limit(5)
        .all()
    )

    seen_lessons = set()
    for p, l, s, c, i in in_progress:
        if l.id in seen_lessons:
            continue
        seen_lessons.add(l.id)
        continue_watching.append({
            "lessonId": l.id,
            "lessonTitle": l.title,
            "courseId": c.id,
            "courseTitle": c.title,
            "thumbnail": c.thumbnail,
            "instructorName": i.name,
            "duration": l.duration,
        })
    logger.debug("Continue watching count: %d", len(continue_watching))

    # 3. Your Lesson Table (upcoming lessons from enrolled courses)
    lesson_query = (
        db.session.query(Lesson, Section, Course, User)
        .select_from(Lesson)
        .join(Section, Lesson.section_id == Section.id)
        .join(Course, Section.course_id == Course.id)
        .join(User, Course.instructor_id == User.id)
        .join(Enrollment, Enrollment.course_id == Course.id)
        .filter(Enrollment.user_id == user_id)
        .order_by(Section.order_number.asc(), Lesson.order_number.asc())
        .limit(10)
        .all()
    )

    all_enrolled_lessons = []
    seen_all = set()
    for l, s, c, u in lesson_query:
        if l.id in seen_all:
            continue
        seen_all.add(l.id)
        all_enrolled_lessons.append({
            "lessonId": l.id,
            "lessonTitle": l.title,
            "courseId": c.id,
            "courseTitle": c.title,
            "thumbnail": c.thumbnail,
            "youtube_url": l.youtube_url,
            "instructorName": u.name,
        })

    # 4. Weekly Progress & Activity Calendar
    today = datetime.utcnow()
    start_of_week = (today - timedelta(days=today.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    days_map = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    activity_by_day = {d: 0 for d in days_map}

    weekly_records = Progress.query.filter(
        Progress.user_id == user_id,
        Progress.completed == True,
        Progress.completed_at >= start_of_week,
    ).all()

    completed_this_week = len(weekly_records)
    for r in weekly_records:
        if r.completed_at:
            activity_by_day[days_map[r.completed_at.weekday()]] += 1

    weekly_goal = 5
    weekly_progress = (
        min(int((completed_this_week / weekly_goal) * 100), 100) if weekly_goal > 0 else 0
    )

    return {
        "enrolledCourses": enrolled_courses,
        "continueWatching": continue_watching,
        "allEnrolledLessons": all_enrolled_lessons,
        "weeklyProgress": weekly_progress,
        "activityByDay": activity_by_day,
    }

def get_mentors_data(user_id: int):
    # Retrieve all distinct courses the user has watched lessons for, explicitly mapped to their instructors
    query = db.session.query(User.id, User.name, Course.id)\
        .select_from(Progress)\
        .join(Lesson, Progress.lesson_id == Lesson.id)\
        .join(Section, Lesson.section_id == Section.id)\
        .join(Course, Section.course_id == Course.id)\
        .join(User, Course.instructor_id == User.id)\
        .filter(Progress.user_id == user_id)\
        .all()
        
    mentor_courses = {}
    for instructor_id, instructor_name, course_id in query:
        if instructor_id not in mentor_courses:
            mentor_courses[instructor_id] = {
                "name": instructor_name,
                "avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={instructor_name}",
                "courses": set()
            }
        mentor_courses[instructor_id]["courses"].add(course_id)
        
    mentors_list = []
    for m_id, data in mentor_courses.items():
        mentors_list.append({
            "id": m_id,
            "name": data["name"],
            "avatar": data["avatar"],
            "coursesWatched": len(data["courses"])
        })
        
    # Sort aggressively by most courses watched
    mentors_list.sort(key=lambda x: x["coursesWatched"], reverse=True)
    
    return mentors_list[:5]
