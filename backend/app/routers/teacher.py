from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models
from ..services.auth_service import get_current_user

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
    if current_user.role != "teacher":
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

    # Исключаем поля, которые нельзя обновлять напрямую
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

    # Исключаем поля, которые нельзя обновлять напрямую
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

    # Исключаем поля, которые нельзя обновлять напрямую
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


# ========== ТЕСТЫ И КОНТРОЛЬНЫЕ РАБОТЫ ==========

@router.get("/tests")
def get_teacher_tests(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    tests = db.query(models.Test).filter(
        models.Test.created_by == current_user.id
    ).all()

    return tests


@router.post("/tests")
def create_test(
        test_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    new_test = models.Test(
        title=test_data.get("title"),
        description=test_data.get("description"),
        course_id=test_data.get("course_id"),
        topic_ids=test_data.get("topic_ids"),
        task_ids=test_data.get("task_ids"),
        duration_minutes=test_data.get("duration_minutes", 45),
        created_by=current_user.id
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return new_test


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

    for key, value in test_data.items():
        if hasattr(test, key):
            setattr(test, key, value)

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

    student_ids = assign_data.get("student_ids", [])

    for student_id in student_ids:
        assignment = models.TestAssignment(
            test_id=test_id,
            student_id=student_id,
            assigned_by=current_user.id
        )
        db.add(assignment)

    db.commit()
    return {"message": f"Test assigned to {len(student_ids)} students"}