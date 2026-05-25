from fastapi import APIRouter, HTTPException

from app.repositories.quizzes import get_quiz_by_course, save_quiz
from app.schemas_quiz import QuizCreate, QuizOut

router = APIRouter(prefix="/courses", tags=["quizzes"])


@router.get("/{course_id}/quizzes", response_model=QuizOut)
async def get_quiz(course_id: str) -> QuizOut:
    quiz = await get_quiz_by_course(course_id)
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found for this course")
    return QuizOut(**quiz)


@router.post("/{course_id}/quizzes", response_model=QuizOut, status_code=201)
async def post_quiz(course_id: str, quiz: QuizCreate) -> QuizOut:
    questions_list = [q.dict() for q in quiz.questions]
    saved = await save_quiz(course_id, quiz.title, questions_list)
    return QuizOut(**saved)
