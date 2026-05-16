from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models
from ..services.auth_service import get_current_user
import random
import re
import json
from sympy import symbols, Eq, solve, sympify
from datetime import datetime

router = APIRouter()


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

    for key, value in template_data.items():
        if hasattr(template, key):
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


# ========== КОНТРОЛЬНЫЕ РАБОТЫ ==========
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
            "questions_count": questions_count
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

    print("=== СОЗДАНИЕ ТЕСТА ===")
    print(f"test_data: {test_data}")

    theory_block_ids = test_data.get("theory_block_ids", [])
    print(f"theory_block_ids: {theory_block_ids}")

    # Проверяем, какие шаблоны есть в БД
    all_templates = db.query(models.QuestionTemplate).all()
    print(f"Всего шаблонов в БД: {len(all_templates)}")
    for t in all_templates:
        print(f"Шаблон id={t.id}, theory_block_id={t.theory_block_id}, title={t.title}")

    for block_id in theory_block_ids:
        templates = db.query(models.QuestionTemplate).filter(
            models.QuestionTemplate.theory_block_id == block_id
        ).all()
        print(f"Для подтемы {block_id} найдено шаблонов: {len(templates)}")

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

    order = 0

    for block_id in theory_block_ids:
        templates = db.query(models.QuestionTemplate).filter(
            models.QuestionTemplate.theory_block_id == block_id
        ).all()

        for template in templates:
            test_question = models.TestQuestion(
                test_id=new_test.id,
                template_id=template.id,
                order_index=order
            )
            db.add(test_question)
            order += 1
            print(f"Добавлен вопрос: template_id={template.id}")

    db.commit()

    questions_count = db.query(models.TestQuestion).filter(
        models.TestQuestion.test_id == new_test.id
    ).count()
    print(f"ИТОГО добавлено вопросов: {questions_count}")

    return {
        "id": new_test.id,
        "title": new_test.title,
        "description": new_test.description,
        "duration_minutes": new_test.duration_minutes,
        "questions_count": questions_count
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
    """Удаление КР"""
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

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

    for student_id in student_ids:
        existing = db.query(models.TestAssignment).filter(
            models.TestAssignment.test_id == test_id,
            models.TestAssignment.student_id == student_id
        ).first()
        if not existing:
            assignment = models.TestAssignment(
                test_id=test_id,
                student_id=student_id,
                assigned_by=current_user.id
            )
            db.add(assignment)

    db.commit()
    return {"message": f"Test assigned to {len(student_ids)} students"}


# ========== ГЕНЕРАЦИЯ ВАРИАНТОВ ==========
def generate_variant(template_text: str, parameters: dict, answer_template: str):
    generated_params = {}

    if parameters:
        for param_name, param_range in parameters.items():
            min_val = param_range.get("min", 1)
            max_val = param_range.get("max", 10)
            param_type = param_range.get("type", "integer")

            if param_type == "integer":
                generated_params[param_name] = random.randint(min_val, max_val)
            else:
                generated_params[param_name] = round(random.uniform(min_val, max_val), 2)

    question_text = template_text
    for name, value in generated_params.items():
        question_text = question_text.replace(f"{{{name}}}", str(value))

    try:
        answer_expr = answer_template
        for name, value in generated_params.items():
            answer_expr = answer_expr.replace(f"{{{name}}}", str(value))
        correct_answer = eval(answer_expr) if answer_expr else None
    except:
        correct_answer = None

    return {
        "question_text": question_text,
        "generated_params": generated_params,
        "correct_answer": correct_answer
    }


@router.get("/tests/generate/{assignment_id}")
def generate_test_variant(
        assignment_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students")

    assignment = db.query(models.TestAssignment).filter(
        models.TestAssignment.id == assignment_id,
        models.TestAssignment.student_id == current_user.id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    test = db.query(models.Test).filter(models.Test.id == assignment.test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    test_questions = db.query(
        models.TestQuestion,
        models.QuestionTemplate
    ).join(
        models.QuestionTemplate,
        models.TestQuestion.template_id == models.QuestionTemplate.id
    ).filter(
        models.TestQuestion.test_id == test.id
    ).order_by(models.TestQuestion.order_index).all()

    questions = []
    generated_params_list = []

    for tq, template in test_questions:
        question_text = template.template_text
        answer_template = template.answer_template
        generated_params = {}

        params = re.findall(r'\{([^}]+)\}', question_text)

        for param in set(params):
            if param == 'a':
                generated_params['a'] = random.randint(1, 10)
            elif param == 'b':
                generated_params['b'] = random.randint(1, 10)
            elif param == 'c':
                generated_params['c'] = random.randint(10, 30)
            else:
                generated_params[param] = random.randint(1, 10)

        for name, value in generated_params.items():
            question_text = question_text.replace(f'{{{name}}}', str(value))
            if answer_template:
                answer_template = answer_template.replace(f'{{{name}}}', str(value))

        correct_answer = None
        if answer_template:
            try:
                correct_answer = eval(answer_template)
                if isinstance(correct_answer, float):
                    correct_answer = round(correct_answer, 2)
                correct_answer = str(correct_answer)
            except:
                correct_answer = answer_template

        questions.append({
            "id": tq.id,
            "text": question_text,
            "correct_answer": correct_answer
        })

        generated_params_list.append({
            "test_question_id": tq.id,
            "params": generated_params,
            "correct_answer": correct_answer
        })

    assignment.generated_params = json.dumps(generated_params_list)
    db.commit()

    return {
        "test_id": test.id,
        "test_title": test.title,
        "duration_minutes": test.duration_minutes,
        "questions": questions
    }


@router.post("/tests/{test_id}/submit/{assignment_id}")
def submit_test(
        test_id: int,
        assignment_id: int,
        submit_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students")

    assignment = db.query(models.TestAssignment).filter(
        models.TestAssignment.id == assignment_id,
        models.TestAssignment.student_id == current_user.id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    answers = submit_data.get("answers", {})

    test_questions = db.query(models.TestQuestion).filter(
        models.TestQuestion.test_id == test_id
    ).order_by(models.TestQuestion.order_index).all()

    score = 0

    for tq in test_questions:
        template = db.query(models.QuestionTemplate).filter(
            models.QuestionTemplate.id == tq.template_id
        ).first()

        if template:
            user_answer = answers.get(str(tq.id), "")

            try:
                if template.answer_template:
                    import json
                    params_list = json.loads(assignment.generated_params) if assignment.generated_params else []

                    correct_answer = None
                    for params in params_list:
                        if params.get("test_question_id") == tq.id:
                            correct_answer = params.get("correct_answer")
                            break

                    if correct_answer is None:
                        correct_answer = template.answer_template
                else:
                    correct_answer = template.template_text
            except Exception as e:
                print(f"Ошибка вычисления: {e}")
                correct_answer = ""

            print(f"Вопрос {tq.id}: ответ='{user_answer}', правильный='{correct_answer}'")

            if str(user_answer).strip() == str(correct_answer).strip():
                score += 1
                print("ВЕРНО")
            else:
                print("НЕВЕРНО")

    print(f"ИТОГО: {score} из {len(test_questions)}")

    assignment.score = score
    assignment.status = "completed"
    assignment.completed_at = datetime.now()
    db.commit()

    return {
        "score": score,
        "total": len(test_questions),
        "percentage": (score / len(test_questions) * 100) if len(test_questions) > 0 else 0
    }

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
            "full_name": s.full_name,
            "email": s.email,
            "class_name": s.class_name,
            "progress": 0
        }
        for s in students
    ]


@router.get("/my-tests")
def get_my_tests(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students")

    assignments = db.query(models.TestAssignment).filter(
        models.TestAssignment.student_id == current_user.id,
        models.TestAssignment.status != "completed"
    ).all()

    result = []
    for assignment in assignments:
        test = db.query(models.Test).filter(models.Test.id == assignment.test_id).first()
        if test:
            result.append({
                "id": test.id,
                "assignment_id": assignment.id,
                "title": test.title,
                "description": test.description,
                "duration_minutes": test.duration_minutes,
                "status": assignment.status
            })

    return result


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
        total_tasks = db.query(models.TaskAttempt.task_id).filter(
            models.TaskAttempt.user_id == student.id,
            models.TaskAttempt.is_correct == True
        ).distinct().count()

        correct_tasks = db.query(models.TaskAttempt.task_id).filter(
            models.TaskAttempt.user_id == student.id,
            models.TaskAttempt.is_correct == True
        ).distinct().count()

        test_assignments = db.query(models.TestAssignment).filter(
            models.TestAssignment.student_id == student.id,
            models.TestAssignment.status == "completed"
        ).all()

        tests_completed = len(test_assignments)
        total_score = sum(a.score for a in test_assignments)
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