from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from ..database import Base

class UserCourse(Base):
    __tablename__ = "user_courses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    course_id = Column(Integer, nullable=False)
    progress = Column(Integer, default=0)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())