# backend/app/models/teacher_course.py
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from ..database import Base

class TeacherCourse(Base):
    __tablename__ = "teacher_courses"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, nullable=False)
    course_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())