from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from ..database import Base

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    achievement_id = Column(Integer, nullable=False)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())