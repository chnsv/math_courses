from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from ..database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, nullable=False)
    type = Column(String(20), nullable=False)  # 'test', 'numeric', 'equation'
    question_text = Column(Text, nullable=False)
    correct_answer = Column(String, nullable=False)
    solution_explanation = Column(Text)
    difficulty = Column(Integer, default=1)  # 1-5
    parameters = Column(JSON)  # для генерации вариантов
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    theory_block_id = Column(Integer, nullable=True)