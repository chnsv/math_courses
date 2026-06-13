from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from ..services.equation_checker import check_equation, check_answer_equivalence
from ..services.variant_generator import VariantGenerator

router = APIRouter()

variant_gen = VariantGenerator()


class EquationCheckRequest(BaseModel):
    equation: str
    user_answer: str


class EquationCheckResponse(BaseModel):
    is_correct: bool
    explanation: str
    correct_solution: Optional[List[str]] = None


class VariantGenerateRequest(BaseModel):
    theory_block_id: int
    difficulty: Optional[int] = None


class TestVariantRequest(BaseModel):
    theory_block_ids: List[int]
    num_questions: int = 10


@router.get("/test")
def test_sympy():
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
    is_correct, explanation, correct_solution = check_equation(
        request.equation,
        request.user_answer
    )

    return EquationCheckResponse(
        is_correct=is_correct,
        explanation=explanation,
        correct_solution=correct_solution
    )


@router.post("/check-equivalence")
def check_equivalence(user_answer: str, correct_answer: str):
    is_equivalent, message = check_answer_equivalence(user_answer, correct_answer)
    return {
        "is_equivalent": is_equivalent,
        "message": message
    }


@router.post("/generate-variant")
def generate_variant_endpoint(request: VariantGenerateRequest):
    variant = variant_gen.generate_variant(
        request.theory_block_id,
        request.difficulty
    )

    if not variant:
        raise HTTPException(status_code=404, detail="No templates found for this subtopic")

    return variant


@router.post("/generate-test")
def generate_test_variant(request: TestVariantRequest):
    variant = variant_gen.generate_test_variant(
        request.theory_block_ids,
        request.num_questions
    )

    if not variant:
        raise HTTPException(status_code=404, detail="No templates found")

    return {
        "questions": variant,
        "total_questions": len(variant)
    }


@router.get("/templates/{theory_block_id}")
def get_templates(theory_block_id: int):
    templates = variant_gen.get_templates_by_subtopic(theory_block_id)
    return {"templates": templates}


@router.post("/generate-from-task/{task_id}")
def generate_from_task(
        task_id: int,
        db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if not task.parameters:
        raise HTTPException(status_code=400, detail="Task does not support variant generation")

    from ..services.variant_generator import generate_variant
    question_text, params_used, correct_answer = generate_variant(
        task.question_text,
        task.parameters
    )

    return {
        "task_id": task.id,
        "question_text": question_text,
        "parameters_used": params_used,
        "correct_answer": str(correct_answer)
    }