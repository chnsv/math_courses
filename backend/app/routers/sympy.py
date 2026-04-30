from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from ..services.equation_checker import check_equation

router = APIRouter()


class EquationCheckRequest(BaseModel):
    equation: str
    user_answer: str


class EquationCheckResponse(BaseModel):
    is_correct: bool
    explanation: str
    correct_solution: Optional[List[str]] = None


@router.post("/check-equation", response_model=EquationCheckResponse)
def check_equation_endpoint(request: EquationCheckRequest):
    """
    Проверка решения уравнения с использованием SymPy.

    Пример запроса:
    {
        "equation": "2*x + 4 = 10",
        "user_answer": "x=3"
    }

    Ответ:
    {
        "is_correct": true,
        "explanation": "✓ Верно! При x = 3 левая часть равна 10, правая — 10.",
        "correct_solution": ["3"]
    }
    """
    is_correct, explanation, correct_solution = check_equation(
        request.equation,
        request.user_answer
    )

    return EquationCheckResponse(
        is_correct=is_correct,
        explanation=explanation,
        correct_solution=correct_solution
    )


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