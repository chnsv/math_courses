from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models
from ..services.auth_service import get_current_user
import random
import re
import json
from sympy import symbols, Eq, solve, sympify
from datetime import datetime

router = APIRouter()

def generate_question_from_template(template, parameters: dict = None):
    question_text = template.template_text
    answer_template = template.answer_template

    if parameters is None:
        parameters = {}
        param_names = re.findall(r'\{([^}]+)\}', question_text)

        for param in param_names:
            if param in ['a', 'b', 'c', 'd', 'k', 'm', 'n']:
                parameters[param] = random.randint(1, 20)
            elif param in ['x', 'y']:
                parameters[param] = random.randint(1, 10)
            else:
                parameters[param] = random.randint(1, 15)

    for name, value in parameters.items():
        question_text = question_text.replace(f'{{{name}}}', str(value))
        if answer_template:
            answer_template = answer_template.replace(f'{{{name}}}', str(value))

    correct_answer = None
    if answer_template:
        try:
            expr = answer_template.replace('\\times', '*').replace('\\div', '/')
            correct_answer = eval(expr)
            if isinstance(correct_answer, float):
                correct_answer = round(correct_answer, 2)
            correct_answer = str(correct_answer)
        except:
            correct_answer = answer_template

    return {
        "question_text": question_text,
        "correct_answer": correct_answer,
        "parameters_used": parameters
    }


# ========== КУРСЫ УЧИТЕЛЯ ==========

@router.get("/courses")
def get_teacher_courses(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    teacher_courses = db.query(models.TeacherCourse).filter(
        models.TeacherCourse.teacher_id == current_user.id
    ).all()

    course_ids = [tc.course_id for tc in teacher_courses]
    courses = db.query(models.Course).filter(models.Course.id.in_(course_ids)).all()

    return courses


@router.get("/courses/{course_id}/students")
def get_course_students(
        course_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    students = db.query(models.User).join(
        models.UserCourse, models.User.id == models.UserCourse.user_id
    ).filter(
        models.UserCourse.course_id == course_id,
        models.User.role == "student"
    ).all()

    return [
        {
            "id": s.id,
            "full_name": s.full_name or s.email,
            "email": s.email,
            "class_name": s.class_name or "—"
        }
        for s in students
    ]


# ========== ТЕМЫ КУРСА ==========

@router.get("/courses/{course_id}/topics")
def get_course_topics(
        course_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    topics = db.query(models.Topic).filter(
        models.Topic.course_id == course_id
    ).order_by(models.Topic.order_index).all()

    return topics

@router.post("/courses/{course_id}/topics")
def create_topic(
        course_id: int,
        topic_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
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


@router.put("/topics/{topic_id}")
def update_topic(
        topic_id: int,
        topic_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    allowed_fields = ["title", "description", "order_index"]
    for key, value in topic_data.items():
        if key in allowed_fields and hasattr(topic, key):
            setattr(topic, key, value)

    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/topics/{topic_id}")
def delete_topic(
        topic_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    db.query(models.TheoryBlock).filter(models.TheoryBlock.topic_id == topic_id).delete()
    db.query(models.Task).filter(models.Task.topic_id == topic_id).delete()
    db.delete(topic)
    db.commit()
    return {"message": "Topic deleted"}


# ========== ТЕОРИЯ ==========

@router.get("/topics/{topic_id}/theory")
def get_topic_theory(
        topic_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    theory_blocks = db.query(models.TheoryBlock).filter(
        models.TheoryBlock.topic_id == topic_id
    ).order_by(models.TheoryBlock.order_index).all()

    return theory_blocks


@router.post("/topics/{topic_id}/theory")
def create_theory_block(
        topic_id: int,
        theory_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    new_block = models.TheoryBlock(
        topic_id=topic_id,
        title=theory_data.get("title"),
        content=theory_data.get("content"),
        order_index=theory_data.get("order_index", 0)
    )
    db.add(new_block)
    db.commit()
    db.refresh(new_block)
    return new_block


@router.put("/theory/{block_id}")
def update_theory_block(
        block_id: int,
        theory_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    block = db.query(models.TheoryBlock).filter(models.TheoryBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Theory block not found")

    allowed_fields = ["title", "content", "order_index"]
    for key, value in theory_data.items():
        if key in allowed_fields and hasattr(block, key):
            setattr(block, key, value)

    db.commit()
    db.refresh(block)
    return block


@router.delete("/theory/{block_id}")
def delete_theory_block(
        block_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    block = db.query(models.TheoryBlock).filter(models.TheoryBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Theory block not found")

    db.delete(block)
    db.commit()
    return {"message": "Theory block deleted"}


# ========== ЗАДАЧИ ==========

@router.get("/topics/{topic_id}/tasks")
def get_topic_tasks(
        topic_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    tasks = db.query(models.Task).filter(
        models.Task.topic_id == topic_id
    ).order_by(models.Task.order_index).all()

    return tasks


@router.post("/topics/{topic_id}/tasks")
def create_task(
        topic_id: int,
        task_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    new_task = models.Task(
        topic_id=topic_id,
        type=task_data.get("type"),
        question_text=task_data.get("question_text"),
        correct_answer=task_data.get("correct_answer"),
        solution_explanation=task_data.get("solution_explanation"),
        difficulty=task_data.get("difficulty", 1),
        parameters=task_data.get("parameters"),
        order_index=task_data.get("order_index", 0)
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.put("/tasks/{task_id}")
def update_task(
        task_id: int,
        task_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    allowed_fields = ["type", "question_text", "correct_answer", "solution_explanation", "difficulty", "parameters",
                      "order_index"]
    for key, value in task_data.items():
        if key in allowed_fields and hasattr(task, key):
            setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(
        task_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}


# ========== ШАБЛОНЫ ЗАДАНИЙ ==========
@router.get("/topics/{topic_id}/templates")
def get_question_templates(
        topic_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    templates = db.query(models.QuestionTemplate).filter(
        models.QuestionTemplate.topic_id == topic_id
    ).order_by(models.QuestionTemplate.difficulty).all()

    return templates


@router.get("/theory-blocks/{theory_block_id}/templates")
def get_templates_by_theory_block(
        theory_block_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    templates = db.query(models.QuestionTemplate).filter(
        models.QuestionTemplate.theory_block_id == theory_block_id
    ).order_by(models.QuestionTemplate.difficulty).all()

    return templates


@router.post("/templates")
def create_question_template(
        template_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    new_template = models.QuestionTemplate(
        topic_id=template_data.get("topic_id"),
        theory_block_id=template_data.get("theory_block_id"),
        title=template_data.get("title"),
        description=template_data.get("description"),
        template_text=template_data.get("template_text"),
        answer_template=template_data.get("answer_template"),
        solution_template=template_data.get("solution_template"),
        parameters=template_data.get("parameters"),
        difficulty=template_data.get("difficulty", 1)
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return new_template


@router.put("/templates/{template_id}")
def update_question_template(
        template_id: int,
        template_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    template = db.query(models.QuestionTemplate).filter(
        models.QuestionTemplate.id == template_id
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    allowed_fields = ["title", "description", "template_text", "answer_template", "solution_template", "parameters",
                      "difficulty"]
    for key, value in template_data.items():
        if key in allowed_fields and hasattr(template, key):
            setattr(template, key, value)

    db.commit()
    db.refresh(template)
    return template


@router.delete("/templates/{template_id}")
def delete_question_template(
        template_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    template = db.query(models.QuestionTemplate).filter(
        models.QuestionTemplate.id == template_id
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    db.delete(template)
    db.commit()
    return {"message": "Template deleted"}


@router.get("/courses/{course_id}/tests")
def get_course_tests(
        course_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    tests = db.query(models.Test).filter(
        models.Test.course_id == course_id
    ).all()

    result = []
    for test in tests:
        questions_count = db.query(models.TestQuestion).filter(
            models.TestQuestion.test_id == test.id
        ).count()
        result.append({
            "id": test.id,
            "title": test.title,
            "description": test.description,
            "duration_minutes": test.duration_minutes,
            "questions_count": questions_count,
            "created_at": test.created_at
        })

    return result


@router.post("/tests")
def create_test(
        test_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    theory_block_ids = test_data.get("theory_block_ids", [])

    all_templates = []
    for block_id in theory_block_ids:
        templates = db.query(models.QuestionTemplate).filter(
            models.QuestionTemplate.theory_block_id == block_id
        ).all()
        all_templates.extend(templates)

    if not all_templates:
        raise HTTPException(
            status_code=400,
            detail="В выбранных подтемах нет шаблонов заданий"
        )

    new_test = models.Test(
        course_id=test_data.get("course_id"),
        title=test_data.get("title"),
        description=test_data.get("description"),
        duration_minutes=test_data.get("duration_minutes", 45),
        created_by=current_user.id
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)

    for idx, template in enumerate(all_templates):
        test_question = models.TestQuestion(
            test_id=new_test.id,
            template_id=template.id,
            order_index=idx
        )
        db.add(test_question)

    db.commit()

    return {
        "id": new_test.id,
        "title": new_test.title,
        "description": new_test.description,
        "duration_minutes": new_test.duration_minutes,
        "questions_count": len(all_templates)
    }

@router.get("/tests/{test_id}")
def get_test(
        test_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    questions = db.query(models.TestQuestion, models.QuestionTemplate).join(
        models.QuestionTemplate,
        models.TestQuestion.template_id == models.QuestionTemplate.id
    ).filter(
        models.TestQuestion.test_id == test_id
    ).order_by(models.TestQuestion.order_index).all()

    return {
        "id": test.id,
        "title": test.title,
        "description": test.description,
        "duration_minutes": test.duration_minutes,
        "questions": [
            {
                "id": q[0].id,
                "template_id": q[1].id,
                "title": q[1].title,
                "template_text": q[1].template_text,
                "difficulty": q[1].difficulty
            }
            for q in questions
        ]
    }


@router.put("/tests/{test_id}")
def update_test(
        test_id: int,
        test_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    test.title = test_data.get("title", test.title)
    test.description = test_data.get("description", test.description)
    test.duration_minutes = test_data.get("duration_minutes", test.duration_minutes)

    if "question_ids" in test_data:
        db.query(models.TestQuestion).filter(
            models.TestQuestion.test_id == test_id
        ).delete()

        for idx, template_id in enumerate(test_data["question_ids"]):
            test_question = models.TestQuestion(
                test_id=test_id,
                template_id=template_id,
                order_index=idx
            )
            db.add(test_question)

    db.commit()
    db.refresh(test)
    return test


@router.delete("/tests/{test_id}")
def delete_test(
        test_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    db.query(models.TestQuestion).filter(models.TestQuestion.test_id == test_id).delete()
    db.query(models.TestAssignment).filter(models.TestAssignment.test_id == test_id).delete()
    db.delete(test)
    db.commit()
    return {"message": "Test deleted"}


@router.post("/tests/{test_id}/assign")
def assign_test_to_students(
        test_id: int,
        assign_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    student_ids = assign_data.get("student_ids", [])
    assigned_count = 0

    for student_id in student_ids:
        existing = db.query(models.TestAssignment).filter(
            models.TestAssignment.test_id == test_id,
            models.TestAssignment.student_id == student_id
        ).first()
        if not existing:
            assignment = models.TestAssignment(
                test_id=test_id,
                student_id=student_id,
                assigned_by=current_user.id,
                status="assigned"
            )
            db.add(assignment)
            assigned_count += 1

    db.commit()
    return {"message": f"Test assigned to {assigned_count} students"}


# ========== ГЕНЕРАЦИЯ ВАРИАНТОВ ДЛЯ УЧЕНИКОВ ==========

@router.post("/tests/{test_id}/generate-for-student/{student_id}")
def generate_test_for_student(
        test_id: int,
        student_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    test_questions = db.query(
        models.TestQuestion, models.QuestionTemplate
    ).join(
        models.QuestionTemplate,
        models.TestQuestion.template_id == models.QuestionTemplate.id
    ).filter(
        models.TestQuestion.test_id == test_id
    ).order_by(models.TestQuestion.order_index).all()

    if not test_questions:
        raise HTTPException(status_code=404, detail="No questions in test")

    generated_questions = []
    for tq, template in test_questions:
        param_names = re.findall(r'\{([^}]+)\}', template.template_text)
        param_values = {}
        for p in param_names:
            param_values[p] = random.randint(1, 20)

        question_text = template.template_text
        answer_template = template.answer_template or ""

        for p, val in param_values.items():
            question_text = question_text.replace(f'{{{p}}}', str(val))
            answer_template = answer_template.replace(f'{{{p}}}', str(val))

        correct_answer = answer_template
        try:
            if answer_template:
                correct_answer = str(eval(answer_template))
        except:
            pass

        generated_questions.append({
            "id": tq.id,
            "text": question_text,
            "correct_answer": correct_answer
        })

    assignment = db.query(models.TestAssignment).filter(
        models.TestAssignment.test_id == test_id,
        models.TestAssignment.student_id == student_id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found. Please assign test first.")

    assignment.generated_questions = json.dumps(generated_questions, ensure_ascii=False)
    assignment.status = "assigned"
    db.commit()

    return {
        "assignment_id": assignment.id,
        "test_id": test.id,
        "title": test.title,
        "description": test.description,
        "duration_minutes": test.duration_minutes,
        "questions_count": len(generated_questions)
    }


@router.get("/tests/assignment/{assignment_id}")
def get_assignment_details(
        assignment_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    assignment = db.query(models.TestAssignment).filter(
        models.TestAssignment.id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if current_user.role == "student" and current_user.id != assignment.student_id:
        raise HTTPException(status_code=403, detail="Not your test")

    test = db.query(models.Test).filter(models.Test.id == assignment.test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    if not assignment.generated_questions:
        raise HTTPException(status_code=404, detail="Test questions not generated yet. Please contact teacher.")

    try:
        generated_questions = json.loads(assignment.generated_questions)
    except:
        raise HTTPException(status_code=500, detail="Error parsing questions")

    if assignment.status == "completed":
        answers = []
        if assignment.answers:
            try:
                answers = json.loads(assignment.answers)
            except:
                answers = []

        return {
            "assignment_id": assignment.id,
            "test_id": test.id,
            "title": test.title,
            "description": test.description,
            "status": "completed",
            "score": assignment.score,
            "total_questions": len(generated_questions),
            "answers": answers
        }
    else:
        return {
            "assignment_id": assignment.id,
            "test_id": test.id,
            "title": test.title,
            "description": test.description,
            "duration_minutes": test.duration_minutes,
            "status": assignment.status,
            "questions": [
                {
                    "id": q["id"],
                    "text": q["text"]
                }
                for q in generated_questions
            ]
        }


@router.post("/tests/submit/{assignment_id}")
def submit_test_answers(
        assignment_id: int,
        submit_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can submit tests")

    assignment = db.query(models.TestAssignment).filter(
        models.TestAssignment.id == assignment_id,
        models.TestAssignment.student_id == current_user.id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if assignment.status == "completed":
        raise HTTPException(status_code=400, detail="Test already completed")

    try:
        generated_questions = json.loads(assignment.generated_questions) if assignment.generated_questions else []
    except:
        generated_questions = []

    if not generated_questions:
        raise HTTPException(status_code=400, detail="No generated questions found. Please contact teacher.")

    answers = submit_data.get("answers", {})

    score = 0
    results = []

    for q in generated_questions:
        user_answer = answers.get(str(q["id"]), "")
        correct_answer = q["correct_answer"]

        user_answer_norm = str(user_answer).strip().lower()
        correct_answer_norm = str(correct_answer).strip().lower()

        user_answer_norm = re.sub(r'\s+', '', user_answer_norm)
        correct_answer_norm = re.sub(r'\s+', '', correct_answer_norm)

        is_correct = user_answer_norm == correct_answer_norm

        if is_correct:
            score += 1

        results.append({
            "question_id": q["id"],
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct
        })

    total_questions = len(generated_questions)
    percentage = (score / total_questions * 100) if total_questions > 0 else 0

    assignment.score = score
    assignment.status = "completed"
    assignment.completed_at = datetime.now()
    assignment.answers = json.dumps(results, ensure_ascii=False)
    db.commit()

    return {
        "score": score,
        "total": total_questions,
        "percentage": round(percentage, 1),
        "results": results
    }


@router.get("/tests/student/{student_id}/assigned")
def get_student_assigned_tests(
        student_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role == "student" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Cannot view other student's tests")

    assignments = db.query(models.TestAssignment).filter(
        models.TestAssignment.student_id == student_id
    ).all()

    result = []
    for assignment in assignments:
        test = db.query(models.Test).filter(models.Test.id == assignment.test_id).first()
        if test:
            result.append({
                "id": assignment.id,
                "test_id": test.id,
                "title": test.title,
                "description": test.description,
                "duration_minutes": test.duration_minutes,
                "status": assignment.status,
                "score": assignment.score if assignment.status == "completed" else None,
                "completed_at": assignment.completed_at
            })

    return result


# ========== СТАТИСТИКА ==========

@router.get("/my-students")
def get_my_students(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    teacher_courses = db.query(models.TeacherCourse).filter(
        models.TeacherCourse.teacher_id == current_user.id
    ).all()
    course_ids = [tc.course_id for tc in teacher_courses]

    if not course_ids:
        return []

    students = db.query(models.User).join(
        models.UserCourse, models.User.id == models.UserCourse.user_id
    ).filter(
        models.UserCourse.course_id.in_(course_ids),
        models.User.role == "student"
    ).distinct().all()

    return [
        {
            "id": s.id,
            "full_name": s.full_name or s.email,
            "email": s.email,
            "class_name": s.class_name or "—"
        }
        for s in students
    ]


@router.get("/students-statistics")
def get_students_statistics(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    teacher_courses = db.query(models.TeacherCourse).filter(
        models.TeacherCourse.teacher_id == current_user.id
    ).all()
    course_ids = [tc.course_id for tc in teacher_courses]

    if not course_ids:
        return []

    students = db.query(models.User).join(
        models.UserCourse, models.User.id == models.UserCourse.user_id
    ).filter(
        models.UserCourse.course_id.in_(course_ids),
        models.User.role == "student"
    ).distinct().all()

    result = []
    for student in students:
        total_tasks = db.query(models.TaskAttempt).filter(
            models.TaskAttempt.user_id == student.id
        ).count()

        correct_tasks = db.query(models.TaskAttempt).filter(
            models.TaskAttempt.user_id == student.id,
            models.TaskAttempt.is_correct == True
        ).count()

        test_assignments = db.query(models.TestAssignment).filter(
            models.TestAssignment.student_id == student.id,
            models.TestAssignment.status == "completed"
        ).all()

        tests_completed = len(test_assignments)
        total_score = sum(a.score for a in test_assignments) if test_assignments else 0
        avg_score = round(total_score / tests_completed, 1) if tests_completed > 0 else 0

        success_rate = round((correct_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0

        result.append({
            "id": student.id,
            "full_name": student.full_name or student.email,
            "email": student.email,
            "class_name": student.class_name or "—",
            "total_tasks": total_tasks,
            "correct_tasks": correct_tasks,
            "success_rate": success_rate,
            "tests_completed": tests_completed,
            "avg_test_score": avg_score
        })

    return result


# ========== ПОДТЕМЫ ДЛЯ ТЕСТОВ ==========
@router.get("/theory-blocks")
def get_all_theory_blocks(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    blocks = db.query(models.TheoryBlock).order_by(models.TheoryBlock.topic_id).all()

    result = []
    for block in blocks:
        template_count = db.query(models.QuestionTemplate).filter(
            models.QuestionTemplate.theory_block_id == block.id
        ).count()
        result.append({
            "id": block.id,
            "title": block.title,
            "topic_id": block.topic_id,
            "template_count": template_count
        })

    return result