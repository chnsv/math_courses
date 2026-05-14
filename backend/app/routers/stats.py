from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from ..database import get_db
from .. import models
from ..services.auth_service import get_current_user

router = APIRouter()


@router.get("/progress")
def get_progress(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    user_id = current_user.id

    total_attempts = db.query(models.TaskAttempt.task_id).filter(
        models.TaskAttempt.user_id == user_id
    ).distinct().count()

    correct_attempts = db.query(models.TaskAttempt.task_id).filter(
        models.TaskAttempt.user_id == user_id,
        models.TaskAttempt.is_correct == True
    ).distinct().count()

    current_xp = current_user.xp
    current_level = current_user.level
    xp_in_level = current_xp % 100
    xp_to_next = 100 - xp_in_level if xp_in_level != 0 else 0

    weak_topics = []
    try:
        from sqlalchemy import func
        topic_stats = db.query(
            models.Topic.id,
            models.Topic.title,
            func.count(func.distinct(models.TaskAttempt.task_id)).label('total'),
            func.sum(func.cast(models.TaskAttempt.is_correct, type_=int)).label('correct')
        ).join(
            models.Task, models.Task.id == models.TaskAttempt.task_id
        ).join(
            models.Topic, models.Topic.id == models.Task.topic_id
        ).filter(
            models.TaskAttempt.user_id == user_id
        ).group_by(
            models.Topic.id, models.Topic.title
        ).all()

        for topic_id, topic_title, total, correct in topic_stats:
            if total > 0:
                correct_percent = (correct / total) * 100
                if correct_percent < 60:
                    weak_topics.append({
                        "topic_id": topic_id,
                        "topic_name": topic_title,
                        "correct_percent": round(correct_percent, 1)
                    })
    except Exception as e:
        print(f"Ошибка: {e}")

    return {
        "total_tasks_solved": total_attempts,
        "total_tasks_correct": correct_attempts,
        "average_score": (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0,
        "current_level": current_level,
        "current_xp": current_xp,
        "xp_to_next_level": xp_to_next,
        "weak_topics": weak_topics
    }

@router.get("/achievements")
def get_achievements(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    achievements = db.query(
        models.Achievement,
        models.UserAchievement.earned_at
    ).join(
        models.UserAchievement,
        models.Achievement.id == models.UserAchievement.achievement_id
    ).filter(
        models.UserAchievement.user_id == current_user.id
    ).all()

    return [
        {
            "id": ach.id,
            "name": ach.name,
            "description": ach.description,
            "icon": ach.icon if ach.icon else "🏆",
            "earned_at": earned_at
        }
        for ach, earned_at in achievements
    ]


@router.get("/leaderboard")
def get_leaderboard(
        limit: int = Query(10, description="Количество записей"),
        db: Session = Depends(get_db)
):
    users = db.query(models.User).order_by(models.User.xp.desc()).limit(limit).all()

    return [
        {
            "rank": idx + 1,
            "user_id": user.id,
            "full_name": user.full_name if user.full_name else user.email,
            "xp": user.xp,
            "level": user.level
        }
        for idx, user in enumerate(users)
    ]


@router.get("/user/{user_id}")
def get_user_stats(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    total_attempts = db.query(models.TaskAttempt).filter(
        models.TaskAttempt.user_id == user_id
    ).count()

    correct_attempts = db.query(models.TaskAttempt).filter(
        models.TaskAttempt.user_id == user_id,
        models.TaskAttempt.is_correct == True
    ).count()

    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "class_name": user.class_name,
        "total_tasks_solved": total_attempts,
        "total_tasks_correct": correct_attempts,
        "average_score": (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0,
        "current_level": user.level,
        "current_xp": user.xp
    }


@router.get("/topic/{topic_id}")
def get_topic_stats(
        topic_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    total_attempts = db.query(models.TaskAttempt).join(
        models.Task, models.Task.id == models.TaskAttempt.task_id
    ).filter(
        models.TaskAttempt.user_id == current_user.id,
        models.Task.topic_id == topic_id
    ).count()

    correct_attempts = db.query(models.TaskAttempt).join(
        models.Task, models.Task.id == models.TaskAttempt.task_id
    ).filter(
        models.TaskAttempt.user_id == current_user.id,
        models.Task.topic_id == topic_id,
        models.TaskAttempt.is_correct == True
    ).count()

    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    topic_name = topic.title if topic else f"Тема {topic_id}"

    return {
        "topic_id": topic_id,
        "topic_name": topic_name,
        "total_tasks": total_attempts,
        "correct_tasks": correct_attempts,
        "correct_percent": (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
    }