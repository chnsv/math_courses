from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas

router = APIRouter()


# ========== УПРАВЛЕНИЕ ТЕМАМИ ==========

@router.post("/topics")
def create_topic(
        topic_data: dict,
        db: Session = Depends(get_db)
):
    """Создание новой темы (только для admin/teacher)"""
    new_topic = models.Topic(
        title=topic_data.get("title"),
        description=topic_data.get("description"),
        parent_id=topic_data.get("parent_id"),
        order_index=topic_data.get("order_index", 0)
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic


@router.put("/topics/{topic_id}")
def update_topic(
        topic_id: int,
        topic_data: dict,
        db: Session = Depends(get_db)
):
    """Обновление темы"""
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    for key, value in topic_data.items():
        if hasattr(topic, key):
            setattr(topic, key, value)

    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    """Удаление темы (каскадно удаляет подтемы и задачи)"""
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    db.delete(topic)
    db.commit()
    return {"message": "Topic deleted successfully"}


# ========== УПРАВЛЕНИЕ ЗАДАЧАМИ ==========

@router.post("/tasks")
def create_task(
        task_data: schemas.TaskCreate,
        db: Session = Depends(get_db)
):
    """Создание новой задачи"""
    new_task = models.Task(
        topic_id=task_data.topic_id,
        type=task_data.type,
        question_text=task_data.question_text,
        correct_answer=task_data.correct_answer,
        solution_explanation=task_data.solution_explanation,
        difficulty=task_data.difficulty,
        parameters=task_data.parameters,
        order_index=0
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Если есть варианты ответов для тестового задания
    if task_data.options:
        for opt in task_data.options:
            test_option = models.TestOption(
                task_id=new_task.id,
                option_text=opt.text,
                is_correct=opt.is_correct,
                order_index=opt.order_index if hasattr(opt, 'order_index') else 0
            )
            db.add(test_option)
        db.commit()

    return new_task


@router.put("/tasks/{task_id}")
def update_task(
        task_id: int,
        task_data: schemas.TaskCreate,
        db: Session = Depends(get_db)
):
    """Обновление задачи"""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.topic_id = task_data.topic_id
    task.type = task_data.type
    task.question_text = task_data.question_text
    task.correct_answer = task_data.correct_answer
    task.solution_explanation = task_data.solution_explanation
    task.difficulty = task_data.difficulty
    task.parameters = task_data.parameters

    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Удаление задачи"""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Удаляем связанные варианты ответов
    db.query(models.TestOption).filter(models.TestOption.task_id == task_id).delete()

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


# ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==========

@router.get("/users")
def get_users(
        role: Optional[str] = Query(None),
        class_name: Optional[str] = Query(None),
        limit: int = 50,
        offset: int = 0,
        db: Session = Depends(get_db)
):
    """Получение списка пользователей с фильтрацией"""
    query = db.query(models.User)

    if role:
        query = query.filter(models.User.role == role)
    if class_name:
        query = query.filter(models.User.class_name == class_name)

    total = query.count()
    users = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "items": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "class_name": u.class_name,
                "role": u.role,
                "xp": u.xp,
                "level": u.level
            }
            for u in users
        ]
    }


@router.put("/users/{user_id}/block")
def block_user(user_id: int, db: Session = Depends(get_db)):
    """Блокировка пользователя (установка role = blocked)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = "blocked"
    db.commit()
    return {"message": f"User {user.email} has been blocked"}


# ========== ЭКСПОРТ ОТЧЁТОВ ==========

@router.get("/export")
def export_stats(
        class_name: Optional[str] = Query(None),
        db: Session = Depends(get_db)
):
    """
    Экспорт статистики класса в формате, готовом для CSV/Excel
    (возвращает JSON для дальнейшей обработки)
    """
    query = db.query(models.User).filter(models.User.role == "student")
    if class_name:
        query = query.filter(models.User.class_name == class_name)

    students = query.all()

    result = []
    for student in students:
        # Статистика студента
        attempts = db.query(models.TaskAttempt).filter(
            models.TaskAttempt.user_id == student.id
        ).all()

        total = len(attempts)
        correct = sum(1 for a in attempts if a.is_correct)

        result.append({
            "full_name": student.full_name,
            "email": student.email,
            "class": student.class_name,
            "total_tasks": total,
            "correct_percent": (correct / total * 100) if total > 0 else 0,
            "xp": student.xp,
            "level": student.level
        })

    return result