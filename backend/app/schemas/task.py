from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class TestOption(BaseModel):
    id: Optional[int] = None
    text: str
    is_correct: bool = False

class TaskCreate(BaseModel):
    topic_id: int
    type: str
    question_text: str
    correct_answer: str
    options: Optional[List[TestOption]] = None

class TaskAttemptRequest(BaseModel):
    user_answer: str