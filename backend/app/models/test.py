from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from ..database import Base

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    course_id = Column(Integer, nullable=False)
    topic_ids = Column(JSON)  # список ID тем
    task_ids = Column(JSON)   # список ID задач
    duration_minutes = Column(Integer, default=45)
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class TestAssignment(Base):
    __tablename__ = "test_assignments"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, nullable=False)
    student_id = Column(Integer, nullable=False)
    assigned_by = Column(Integer, nullable=False)
    status = Column(String(20), default="pending")  # pending, in_progress, completed
    score = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, nullable=False)
    task_id = Column(Integer, nullable=False)
    user_answer = Column(String)
    is_correct = Column(Integer, default=0)
    generated_params = Column(JSON)  # сгенерированные параметры для варианта
    created_at = Column(DateTime(timezone=True), server_default=func.now())