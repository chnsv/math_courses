from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models
from ..services.auth_service import get_current_user

router = APIRouter()


@router.get("/")
def get_topics(
        course_id: Optional[int] = Query(None, description="ID курса для фильтрации"),
        db: Session = Depends(get_db)
):
    query = db.query(models.Topic)
    if course_id:
        query = query.filter(models.Topic.course_id == course_id)
    topics = query.order_by(models.Topic.order_index).all()
    return topics


@router.get("/{topic_id}")
def get_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


@router.get("/{topic_id}/theory")
def get_theory(topic_id: int, db: Session = Depends(get_db)):
    theory_blocks = db.query(models.TheoryBlock).filter(
        models.TheoryBlock.topic_id == topic_id
    ).order_by(models.TheoryBlock.order_index).all()

    return {
        "topic_id": topic_id,
        "blocks": [
            {
                "id": block.id,
                "title": block.title,
                "content": block.content,
                "order_index": block.order_index
            }
            for block in theory_blocks
        ]
    }


@router.post("/{topic_id}/theory")
def create_theory_block(
        topic_id: int,
        theory_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
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


@router.delete("/theory/{block_id}")
def delete_theory_block(
        block_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    block = db.query(models.TheoryBlock).filter(models.TheoryBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Theory block not found")

    db.delete(block)
    db.commit()
    return {"message": "Theory block deleted"}

@router.post("/{topic_id}/tasks")
def create_task(
        topic_id: int,
        task_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    new_task = models.Task(
        topic_id=topic_id,
        type=task_data.get("type"),
        question_text=task_data.get("question_text"),
        correct_answer=task_data.get("correct_answer"),
        solution_explanation=task_data.get("solution_explanation"),
        difficulty=task_data.get("difficulty", 1),
        order_index=task_data.get("order_index", 0)
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task