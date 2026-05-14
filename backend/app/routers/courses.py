from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from .. import models
from ..services.auth_service import decode_token, get_current_user
router = APIRouter()

@router.get("/available")
def get_available_courses(
        authorization: Optional[str] = Header(None),
        db: Session = Depends(get_db)
):
    print("get_available_courses called")

    # Получаем пользователя из токена
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        try:
            payload = decode_token(token)
            user_id = int(payload.get("sub"))
        except Exception as e:
            print(f"Token decode error: {e}")

    if not user_id:
        all_courses = db.query(models.Course).all()
        return all_courses

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.role != "student":
        all_courses = db.query(models.Course).all()
        return all_courses

    enrolled = db.query(models.UserCourse).filter(
        models.UserCourse.user_id == user_id
    ).all()
    enrolled_course_ids = [e.course_id for e in enrolled]

    all_courses = db.query(models.Course).all()

    if enrolled_course_ids:
        available = [c for c in all_courses if c.id not in enrolled_course_ids]
    else:
        available = all_courses

    return available


@router.get("/my-courses")
def get_my_courses(
        authorization: Optional[str] = Header(None),
        db: Session = Depends(get_db)
):
    """Получение курсов, на которые записан ученик"""
    print("get_my_courses called")

    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        try:
            payload = decode_token(token)
            user_id = int(payload.get("sub"))
        except Exception as e:
            print(f"Token decode error: {e}")

    if not user_id:
        return []

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.role != "student":
        return []

    enrollments = db.query(models.UserCourse).filter(
        models.UserCourse.user_id == user_id
    ).all()

    if not enrollments:
        return []

    course_ids = [e.course_id for e in enrollments]
    courses = db.query(models.Course).filter(models.Course.id.in_(course_ids)).all()

    result = []
    for course in courses:
        enrollment = next(e for e in enrollments if e.course_id == course.id)
        progress = enrollment.progress if enrollment.progress else 0

        # Если прогресс не сохранён, вычисляем его
        if progress == 0:
            # Получаем все темы курса
            topics = db.query(models.Topic).filter(models.Topic.course_id == course.id).all()
            if topics:
                total_topics = len(topics)
                completed_topics = 0
                for topic in topics:
                    tasks = db.query(models.Task).filter(models.Task.topic_id == topic.id).all()
                    task_ids = [t.id for t in tasks]
                    if task_ids:
                        # Проверяем, все ли задачи темы решены правильно
                        attempts = db.query(models.TaskAttempt).filter(
                            models.TaskAttempt.user_id == user_id,
                            models.TaskAttempt.task_id.in_(task_ids),
                            models.TaskAttempt.is_correct == True
                        ).all()
                        completed_count = len(set(a.task_id for a in attempts))
                        if completed_count == len(task_ids) and len(task_ids) > 0:
                            completed_topics += 1
                progress = (completed_topics / total_topics * 100) if total_topics > 0 else 0
                enrollment.progress = int(progress)
                db.commit()

        result.append({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "slug": course.slug,
            "progress": progress
        })

    return result


@router.post("/enroll/{course_id}")
def enroll_course(
        course_id: int,
        authorization: Optional[str] = Header(None),
        db: Session = Depends(get_db)
):
    """Запись ученика на курс"""
    print(f"enroll_course: course_id={course_id}")

    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        try:
            payload = decode_token(token)
            user_id = int(payload.get("sub"))
        except Exception as e:
            print(f"Token decode error: {e}")

    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can enroll")

    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = db.query(models.UserCourse).filter(
        models.UserCourse.user_id == user_id,
        models.UserCourse.course_id == course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = models.UserCourse(
        user_id=user_id,
        course_id=course_id
    )
    db.add(enrollment)
    db.commit()

    return {"message": "Successfully enrolled", "course": course}

@router.get("/")
def get_courses(db: Session = Depends(get_db)):
    """Получение всех курсов"""
    courses = db.query(models.Course).order_by(models.Course.order_index).all()
    return courses

@router.post("/")
def create_course(
        course_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    new_course = models.Course(
        title=course_data.get("title"),
        description=course_data.get("description"),
        slug=course_data.get("slug"),
        order_index=course_data.get("order_index", 0)
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@router.get("/my-courses/{course_id}/progress")
def get_course_progress(
        course_id: int,
        authorization: Optional[str] = Header(None),
        db: Session = Depends(get_db)
):
    """Получение прогресса по конкретному курсу"""
    print(f"get_course_progress: course_id={course_id}")

    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        try:
            payload = decode_token(token)
            user_id = int(payload.get("sub"))
        except Exception as e:
            print(f"Token decode error: {e}")

    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.role != "student":
        raise HTTPException(status_code=403, detail="Only students")

    enrollment = db.query(models.UserCourse).filter(
        models.UserCourse.user_id == user_id,
        models.UserCourse.course_id == course_id
    ).first()
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")

    topics = db.query(models.Topic).filter(models.Topic.course_id == course_id).all()

    topic_progress = []
    for topic in topics:
        tasks = db.query(models.Task).filter(models.Task.topic_id == topic.id).all()
        task_ids = [t.id for t in tasks]

        attempts = db.query(models.TaskAttempt).filter(
            models.TaskAttempt.user_id == user_id,
            models.TaskAttempt.task_id.in_(task_ids) if task_ids else False
        ).all() if task_ids else []

        total = len(tasks)
        correct = len([a for a in attempts if a.is_correct])
        percent = round((correct / total * 100) if total > 0 else 0)

        topic_progress.append({
            "id": topic.id,
            "title": topic.title,
            "progress": percent,
            "completed": correct == total and total > 0
        })

    if topics and len(topics) > 0:
        avg_progress = sum(t["progress"] for t in topic_progress) // len(topics)
        enrollment.progress = avg_progress
        db.commit()

    return topic_progress




@router.get("/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Получение курса по ID"""
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/{course_id}/topics")
def create_topic(
        course_id: int,
        topic_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Создание темы в курсе (только для admin)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Проверяем, существует ли курс
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    new_topic = models.Topic(
        course_id=course_id,
        title=topic_data.get("title"),
        description=topic_data.get("description"),
        order_index=topic_data.get("order_index", 0)
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic


@router.post("/{course_id}/assign-teacher")
def assign_teacher_to_course(
        course_id: int,
        teacher_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Назначение учителя на курс (только для admin)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    teacher_id = teacher_data.get("teacher_id")

    # Проверяем, существует ли учитель
    teacher = db.query(models.User).filter(
        models.User.id == teacher_id,
        models.User.role == "teacher"
    ).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Проверяем, существует ли курс
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Проверяем, не назначен ли уже
    existing = db.query(models.TeacherCourse).filter(
        models.TeacherCourse.teacher_id == teacher_id,
        models.TeacherCourse.course_id == course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Teacher already assigned to this course")

    assignment = models.TeacherCourse(
        teacher_id=teacher_id,
        course_id=course_id
    )
    db.add(assignment)
    db.commit()

    return {"message": f"Teacher {teacher.email} assigned to course {course.title}"}


@router.get("/{course_id}/teachers")
def get_course_teachers(
        course_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Получение списка учителей, назначенных на курс"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    assignments = db.query(models.TeacherCourse).filter(
        models.TeacherCourse.course_id == course_id
    ).all()

    teacher_ids = [a.teacher_id for a in assignments]
    teachers = db.query(models.User).filter(models.User.id.in_(teacher_ids)).all() if teacher_ids else []

    return [
        {
            "id": t.id,
            "email": t.email,
            "full_name": t.full_name
        }
        for t in teachers
    ]