from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from ..database import Base

class QuestionTemplate(Base):
    __tablename__ = "question_templates"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, nullable=False)
    theory_block_id = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    template_text = Column(Text, nullable=False)
    answer_template = Column(String, nullable=False)
    solution_template = Column(Text)
    parameters = Column(JSON)
    difficulty = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())