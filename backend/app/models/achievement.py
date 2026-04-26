from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from ..database import Base

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    icon = Column(String)
    required_xp = Column(Integer, default=0)
    required_condition = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())