from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from .. import models

router = APIRouter()


@router.get("/progress")
def get_progress(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Получение прогресса пользователя.
    Возвращает статистику по решённым задачам, XP, уровень.
    """
    # Общее количество попыток
    total_attempts = db.query(models.TaskAttempt).filter(
        models.TaskAttempt.user_id == user_id
    ).count()

    # Количество правильных ответов
    correct_attempts = db.query(models.TaskAttempt).filter(
        models.TaskAttempt.user_id == user_id,
        models.TaskAttempt.is_correct == True
    ).count()

    # Данные пользователя
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # XP до следующего уровня (каждый уровень = 100 XP)
    xp_to_next = 100 - (user.xp % 100)

    return {
        "total_tasks_solved": total_attempts,
        "total_tasks_correct": correct_attempts,
        "average_score": (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0,
        "current_level": user.level,
        "current_xp": user.xp,
        "xp_to_next_level": xp_to_next,
        "weak_topics": [],  # TODO: реализовать анализ ошибок по темам
    }


@router.get("/leaderboard")
def get_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    """
    Получение рейтинга пользователей по XP.
    """
    users = db.query(models.User).order_by(models.User.xp.desc()).limit(limit).all()

    return [
        {
            "rank": idx + 1,
            "user_id": user.id,
            "full_name": user.full_name or user.email,
            "xp": user.xp,
            "level": user.level
        }
        for idx, user in enumerate(users)
    ]