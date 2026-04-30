from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import schemas, models, services
from ..database import get_db

router = APIRouter()

# Начисление XP за разные типы заданий
XP_REWARDS = {
    'test': 10,
    'numeric': 20,
    'equation': 30
}


@router.get("/")
def get_tasks(
        topic_id: int = Query(..., description="ID темы"),
        task_type: Optional[str] = Query(None, description="Тип задачи: test, numeric, equation"),
        db: Session = Depends(get_db)
):
    """
    Получение списка задач по теме.
    Если указан task_type, возвращаются только задачи этого типа.
    """
    query = db.query(models.Task).filter(models.Task.topic_id == topic_id)

    if task_type:
        query = query.filter(models.Task.type == task_type)

    tasks = query.order_by(models.Task.order_index).all()

    result = []
    for task in tasks:
        task_data = {
            "id": task.id,
            "type": task.type,
            "question_text": task.question_text,
            "difficulty": task.difficulty
        }

        # Для тестовых заданий добавляем варианты ответов
        if task.type == 'test':
            options = db.query(models.TestOption).filter(
                models.TestOption.task_id == task.id
            ).order_by(models.TestOption.order_index).all()
            task_data["options"] = [
                {"id": opt.id, "text": opt.option_text}
                for opt in options
            ]

        result.append(task_data)

    return result


@router.post("/{task_id}/attempt", response_model=schemas.TaskAttemptResponse)
def submit_attempt(
        task_id: int,
        attempt_data: schemas.TaskAttemptRequest,
        db: Session = Depends(get_db)
):
    """
    Отправка ответа на задачу.
    Проверяет правильность, начисляет XP, сохраняет попытку.
    """
    # Получаем задачу из БД
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Проверка ответа в зависимости от типа задачи
    is_correct = False
    explanation = ""

    if task.type == 'test':
        # Для тестов: сравниваем с правильным вариантом
        correct_option = db.query(models.TestOption).filter(
            models.TestOption.task_id == task_id,
            models.TestOption.is_correct == True
        ).first()

        if correct_option:
            is_correct = (attempt_data.user_answer == str(correct_option.id))
        else:
            is_correct = False

        explanation = task.solution_explanation or "Правильный ответ: " + task.correct_answer

    elif task.type == 'numeric':
        # Для числовых задач: сравниваем с учётом погрешности
        try:
            user_val = float(attempt_data.user_answer.replace(',', '.'))
            correct_val = float(task.correct_answer.replace(',', '.'))
            is_correct = abs(user_val - correct_val) < 0.01
        except ValueError:
            is_correct = False

        if is_correct:
            explanation = "✓ Верный ответ!"
        else:
            explanation = f"✗ Неверно. Правильный ответ: {task.correct_answer}"

    elif task.type == 'equation':
        # Для уравнений: используем SymPy (пока заглушка)
        # ПОЗЖЕ ЗДЕСЬ БУДЕТ ВЫЗОВ services.equation_checker.check_equation
        # Пока временная проверка
        if attempt_data.user_answer.strip() == task.correct_answer.strip():
            is_correct = True
            explanation = "✓ Уравнение решено верно!"
        else:
            is_correct = False
            explanation = f"✗ Неверно. Правильное решение: {task.solution_explanation or task.correct_answer}"
    else:
        is_correct = False

    # Начисление очков опыта (XP)
    earned_xp = XP_REWARDS.get(task.type, 10) if is_correct else 0
    score = 100 if is_correct else 0

    # Сохраняем попытку (временно user_id = 1, позже будем брать из токена)
    # TODO: заменить на реальный user_id из JWT
    try:
        from ..services.auth_service import get_current_user
        # current_user = get_current_user(token, db)  # пока упростим
        user_id = 1  # временно
    except:
        user_id = 1

    attempt = models.TaskAttempt(
        user_id=user_id,
        task_id=task_id,
        user_answer=attempt_data.user_answer,
        is_correct=is_correct,
        score=score,
        time_spent=0
    )
    db.add(attempt)

    # Обновление XP пользователя (если есть)
    if is_correct and earned_xp > 0:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.xp += earned_xp
            # Обновление уровня (каждые 100 XP — новый уровень)
            new_level = user.xp // 100 + 1
            if new_level > user.level:
                user.level = new_level
            db.add(user)

    db.commit()

    # Формируем пояснение для пользователя
    if not is_correct and not explanation:
        explanation = task.solution_explanation or "Правильный ответ: " + task.correct_answer

    return schemas.TaskAttemptResponse(
        is_correct=is_correct,
        score=score,
        earned_xp=earned_xp,
        solution_explanation=explanation
    )