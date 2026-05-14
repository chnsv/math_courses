from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    duration_minutes = Column(Integer, default=45)
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class TestQuestion(Base):
    __tablename__ = "test_questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, nullable=False)
    template_id = Column(Integer, nullable=False)
    order_index = Column(Integer, default=0)


class TestAssignment(Base):
    __tablename__ = "test_assignments"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    assigned_by = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    score = Column(Integer, default=0)
    generated_params = Column(Text, nullable=True)
    assigned_at = Column(DateTime, default=datetime.now)
    completed_at = Column(DateTime, nullable=True)
class TestAnswer(Base):
    __tablename__ = "test_answers"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, nullable=False)
    question_id = Column(Integer, nullable=False)
    generated_params = Column(JSON)
    user_answer = Column(String)
    is_correct = Column(Integer, default=0)
    earned_points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())