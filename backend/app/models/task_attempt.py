from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..database import Base

class TaskAttempt(Base):
    __tablename__ = "task_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    task_id = Column(Integer, nullable=False)
    user_answer = Column(String)
    is_correct = Column(Boolean)
    score = Column(Integer)
    time_spent = Column(Integer)  # в секундах
    created_at = Column(DateTime(timezone=True), server_default=func.now())