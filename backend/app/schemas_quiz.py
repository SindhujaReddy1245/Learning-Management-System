from pydantic import BaseModel, Field


class QuizQuestion(BaseModel):
    question: str = Field(..., min_length=1)
    options: list[str] = Field(..., min_items=4, max_items=4)
    correctAnswer: int = Field(..., ge=0, le=3)


class QuizCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=180)
    questions: list[QuizQuestion] = Field(..., min_items=1)


class QuizOut(QuizCreate):
    id: str
    courseId: str
