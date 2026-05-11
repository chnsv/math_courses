from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from ..services.auth_service import get_current_user

router = APIRouter()


@router.get("/")
def get_courses(db: Session = Depends(get_db)):
    """Получение списка всех курсов"""
    courses = db.query(models.Course).order_by(models.Course.order_index).all()
    return courses


@router.post("/")
def create_course(
        course_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Создание нового курса (только для admin)"""
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


@router.get("/{course_id}/topics")
def get_course_topics(course_id: int, db: Session = Depends(get_db)):
    """Получение всех тем курса"""
    topics = db.query(models.Topic).filter(
        models.Topic.course_id == course_id
    ).order_by(models.Topic.order_index).all()
    return topics


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


@router.delete("/topics/{topic_id}")
def delete_topic(
        topic_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Удаление темы (только для admin)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    db.delete(topic)
    db.commit()
    return {"message": "Topic deleted"}