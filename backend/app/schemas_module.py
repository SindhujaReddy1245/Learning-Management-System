from pydantic import BaseModel, Field
from typing import List

class ModuleCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=180)
    description: str = Field(..., min_length=1)
    order: int = Field(..., ge=1)  # order within the course

class ModuleOut(ModuleCreate):
    id: str
    courseId: str
    lessonsCount: int = 0
    rating: str = "5.0"

class ModulePdfOut(BaseModel):
    id: str
    moduleId: str
    filename: str
    url: str | None = None
    contentType: str = "application/pdf"
    sizeBytes: int
    uploadedAt: str

class ModuleVideoOut(BaseModel):
    id: str
    moduleId: str
    filename: str
    url: str
    publicId: str | None = None
    contentType: str = "video/mp4"
    sizeBytes: int
    duration: float | None = None
    uploadedAt: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctAnswer: int

class ModuleQuizCreate(BaseModel):
    title: str
    questions: List[QuizQuestion]

class ModuleQuizOut(BaseModel):
    id: str
    moduleId: str
    title: str
    questions: List[QuizQuestion]

class QuizAttemptCreate(BaseModel):
    studentId: str
    answers: List[int]  # chosen indices per question

class QuizAttemptOut(BaseModel):
    id: str
    moduleId: str
    studentId: str
    score: float
    submittedAt: str
    answers: List[int]
