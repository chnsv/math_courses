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
    solution_explanation: Optional[str] = None
    difficulty: int = 1
    parameters: Optional[Dict[str, Any]] = None
    options: Optional[List[TestOption]] = None

class TaskResponse(BaseModel):
    id: int
    type: str
    question_text: str
    difficulty: int
    options: Optional[List[TestOption]] = None

class TaskAttemptRequest(BaseModel):
    user_answer: str

class TaskAttemptResponse(BaseModel):
    is_correct: bool
    score: int
    earned_xp: int
    solution_explanation: Optional[str] = None