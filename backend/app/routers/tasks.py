from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from .. import models
from ..services.auth_service import get_current_user

router = APIRouter()

XP_REWARDS = {
    'test': 10,
    'numeric': 20,
    'equation': 30,
    'text': 25,
    'integral': 40,
    'derivative': 35,
    'system': 35,
    'inequality': 30,
    'geometry': 30
}

@router.get("/")
def get_tasks(
        topic_id: int = Query(..., description="ID темы"),
        task_type: Optional[str] = Query(None, description="Тип задачи: test, numeric, equation"),
        db: Session = Depends(get_db)
):
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


@router.get("/{task_id}")
def get_task(
        task_id: int,
        db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return {
        "id": task.id,
        "topic_id": task.topic_id,
        "type": task.type,
        "question_text": task.question_text,
        "correct_answer": task.correct_answer,
        "solution_explanation": task.solution_explanation,
        "difficulty": task.difficulty,
        "order_index": task.order_index
    }


@router.post("/{task_id}/attempt")
def submit_attempt(
        task_id: int,
        attempt_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    existing_correct = db.query(models.TaskAttempt).filter(
        models.TaskAttempt.user_id == current_user.id,
        models.TaskAttempt.task_id == task_id,
        models.TaskAttempt.is_correct == True
    ).first()

    if existing_correct:
        return {
            "is_correct": True,
            "score": 0,
            "earned_xp": 0,
            "already_solved": True,
            "solution_explanation": "Вы уже решили эту задачу ранее!"
        }

    user_answer = attempt_data.get("user_answer", "").strip()
    is_correct = False
    explanation = ""

    if task.type == 'test':
        correct_option = db.query(models.TestOption).filter(
            models.TestOption.task_id == task_id,
            models.TestOption.is_correct == True
        ).first()

        if correct_option:
            is_correct = (user_answer == str(correct_option.id))
        explanation = task.solution_explanation or f"Правильный ответ: {task.correct_answer}"

    elif task.type == 'numeric':
        try:
            user_val = float(user_answer.replace(',', '.'))
            correct_val = float(task.correct_answer.replace(',', '.'))
            is_correct = abs(user_val - correct_val) < 0.01
            if is_correct:
                explanation = "Верный ответ!"
            else:
                explanation = task.solution_explanation or f"Неверно. Правильный ответ: {task.correct_answer}"
        except ValueError:
            is_correct = False
            explanation = "Неверный формат ответа. Введите число."

    elif task.type == 'equation':
        try:
            from sympy import symbols, Eq, solve, sympify, simplify

            import re
            question_text = task.question_text
            variables = re.findall(r'([a-zA-Z])', question_text)
            var_name = next((v for v in variables if v not in ['cos', 'sin', 'tan', 'log', 'sqrt']), 'x')
            x = symbols(var_name)

            if '=' in question_text:
                left_str, right_str = question_text.split('=')
            else:
                left_str, right_str = question_text, '0'

            try:
                left_expr = sympify(left_str.strip())
                right_expr = sympify(right_str.strip())
                equation = Eq(left_expr, right_expr)
                correct_solutions = solve(equation, x)
            except Exception:
                correct_solutions = [task.correct_answer]

            user_answer_clean = user_answer.replace(' ', '')
            if '=' in user_answer_clean:
                _, user_val_part = user_answer_clean.split('=')
                try:
                    user_value = sympify(user_val_part)
                except Exception:
                    user_value = user_answer_clean
            else:
                try:
                    user_value = sympify(user_answer_clean)
                except Exception:
                    user_value = user_answer_clean

            if correct_solutions and len(correct_solutions) > 0:
                try:
                    correct_val = correct_solutions[0]
                    if isinstance(correct_val, (int, float)):
                        user_num = float(user_value) if hasattr(user_value, 'evalf') else float(user_value)
                        correct_num = float(correct_val)
                        is_correct = abs(user_num - correct_num) < 0.01
                    else:
                        is_correct = simplify(user_value - correct_val) == 0
                except Exception:
                    is_correct = user_answer_clean == str(correct_solutions[0])
            else:
                is_correct = user_answer_clean == task.correct_answer

            if is_correct:
                explanation = "Уравнение решено верно!"
            else:
                explanation = task.solution_explanation or f"Неверно. Правильный ответ: {correct_solutions[0] if correct_solutions else task.correct_answer}"
        except Exception as e:
            print(f"SymPy ошибка: {e}")
            is_correct = user_answer == task.correct_answer
            explanation = task.solution_explanation or f"Правильный ответ: {task.correct_answer}"

    elif task.type == 'text':
        # Текстовая задача — проверка по ключевым словам или частичное совпадение
        user_lower = user_answer.lower()
        correct_lower = task.correct_answer.lower()
        is_correct = user_lower == correct_lower or correct_lower in user_lower
        if is_correct:
            explanation = "Верный ответ!"
        else:
            explanation = task.solution_explanation or f"Правильный ответ: {task.correct_answer}"

    elif task.type == 'integral':
        try:
            from sympy import Integral, symbols, simplify
            is_correct = user_answer == task.correct_answer
            explanation = task.solution_explanation or f"Правильный ответ: {task.correct_answer}"
        except Exception:
            is_correct = user_answer == task.correct_answer
            explanation = task.solution_explanation or f"Правильный ответ: {task.correct_answer}"

    elif task.type == 'derivative':
        try:
            from sympy import diff, symbols, simplify
            is_correct = user_answer == task.correct_answer
            explanation = task.solution_explanation or f"Правильный ответ: {task.correct_answer}"
        except Exception:
            is_correct = user_answer == task.correct_answer
            explanation = task.solution_explanation or f"Правильный ответ: {task.correct_answer}"

    elif task.type in ['system', 'inequality', 'geometry']:
        is_correct = user_answer == task.correct_answer
        explanation = task.solution_explanation or f"Правильный ответ: {task.correct_answer}"

    else:
        is_correct = user_answer == task.correct_answer
        explanation = task.solution_explanation or f"Правильный ответ: {task.correct_answer}"

    earned_xp = XP_REWARDS.get(task.type, 10) if is_correct else 0
    score = 100 if is_correct else 0

    attempt = models.TaskAttempt(
        user_id=current_user.id,
        task_id=task_id,
        user_answer=user_answer,
        is_correct=is_correct,
        score=score,
        time_spent=0
    )
    db.add(attempt)

    if is_correct and earned_xp > 0:
        current_user.xp += earned_xp
        new_level = current_user.xp // 100 + 1
        if new_level > current_user.level:
            current_user.level = new_level
        db.add(current_user)

    db.commit()

    return {
        "is_correct": is_correct,
        "score": score,
        "earned_xp": earned_xp,
        "solution_explanation": explanation
    }

@router.delete("/{task_id}")
def delete_task(
        task_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.query(models.TestOption).filter(models.TestOption.task_id == task_id).delete()

    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}