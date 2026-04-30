from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import Topic, TheoryBlock

router = APIRouter()


@router.get("/")
def get_topics(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:

    root_topics = db.query(Topic).filter(Topic.parent_id.is_(None)).order_by(Topic.order_index).all()

    def build_tree(topic: Topic) -> Dict[str, Any]:

        children = db.query(Topic).filter(Topic.parent_id == topic.id).order_by(Topic.order_index).all()

        return {
            "id": topic.id,
            "title": topic.title,
            "description": topic.description,
            "children": [build_tree(child) for child in children]
        }

    return [build_tree(topic) for topic in root_topics]


@router.get("/{topic_id}/theory")
def get_theory(topic_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:

    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    theory_blocks = db.query(TheoryBlock).filter(
        TheoryBlock.topic_id == topic_id
    ).order_by(TheoryBlock.order_index).all()

    return {
        "topic_id": topic_id,
        "title": topic.title,
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