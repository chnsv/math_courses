from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from ..services.equation_checker import check_equation
from ..services.variant_generator import generate_variant

router = APIRouter()


class EquationCheckRequest(BaseModel):
    equation: str
    user_answer: str


class EquationCheckResponse(BaseModel):
    is_correct: bool
    explanation: str
    correct_solution: Optional[List[str]] = None


@router.get("/test")
def test_sympy():
    """Тестовый эндпоинт для проверки работы SymPy"""
    try:
        from sympy import symbols, Eq, solve
        x = symbols('x')
        equation = Eq(2 * x + 4, 10)
        solution = solve(equation, x)
        return {
            "status": "ok",
            "test_equation": "2*x + 4 = 10",
            "solution": str(solution)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/check-equation", response_model=EquationCheckResponse)
def check_equation_endpoint(request: EquationCheckRequest):
    """Проверка решения уравнения с использованием SymPy (ФТ 6.1)"""
    is_correct, explanation, correct_solution = check_equation(
        request.equation,
        request.user_answer
    )

    return EquationCheckResponse(
        is_correct=is_correct,
        explanation=explanation,
        correct_solution=correct_solution
    )


@router.post("/generate-variant")
def generate_variant_endpoint(
        task_id: int,
        db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if not task.parameters:
        raise HTTPException(status_code=400, detail="Task does not support variant generation")

    question_text, params_used, correct_answer = generate_variant(
        task.question_text,
        task.parameters
    )

    return {
        "task_id": task.id,
        "question_text": question_text,
        "parameters_used": params_used,
        "correct_answer": correct_answer
    }