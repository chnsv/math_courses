from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..database import Base

class TestOption(Base):
    __tablename__ = "test_options"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, nullable=False)
    option_text = Column(String, nullable=False)
    is_correct = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())