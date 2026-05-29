from io import BytesIO
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import RedirectResponse, StreamingResponse
from typing import List

from app.repositories.modules import (
    get_module_pdf_file as repo_get_module_pdf_file,
    get_module_video as repo_get_module_video,
    list_modules,
    create_module,
    list_module_pdfs,
    save_module_pdf,
    save_module_video,
)
from app.cloudinary_client import upload_module_video
from app.repositories.module_quizzes import (
    get_module_quiz as repo_get_module_quiz,
    save_module_quiz as repo_save_module_quiz,
)
from app.repositories.module_quiz_attempts import (
    get_attempts_for_student,
    save_quiz_attempt,
)
from app.schemas_module import (
    ModuleCreate,
    ModuleOut,
    ModulePdfOut,
    ModuleVideoOut,
    ModuleQuizCreate,
    ModuleQuizOut,
    QuizAttemptCreate,
    QuizAttemptOut,
)

# No prefix – routes will be mounted under the global "api" prefix in main.py
router = APIRouter(tags=["modules"])

# Modules endpoints (under /api/courses/{course_id}/modules)
@router.get("/courses/{course_id}/modules", response_model=List[ModuleOut])
async def get_course_modules(course_id: str) -> List[ModuleOut]:
    return await list_modules(course_id)

@router.post("/courses/{course_id}/modules", response_model=ModuleOut, status_code=201)
async def post_course_module(course_id: str, module: ModuleCreate) -> ModuleOut:
    return await create_module(module, course_id)

# Module PDFs endpoints (nested under modules)
@router.get("/modules/{module_id}/pdfs", response_model=List[ModulePdfOut])
async def get_module_pdfs(module_id: str) -> List[ModulePdfOut]:
    return await list_module_pdfs(module_id)

@router.post("/modules/{module_id}/pdfs", response_model=ModulePdfOut, status_code=201)
async def post_module_pdf(module_id: str, file: UploadFile = File(...)) -> ModulePdfOut:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="PDF file is empty")
    filename = file.filename or "module-material.pdf"
    return await save_module_pdf(module_id, filename, file.content_type, file_bytes)

@router.get("/modules/{module_id}/pdfs/{pdf_id}/file")
async def get_module_pdf_file(module_id: str, pdf_id: str, download: bool = False):
    pdf = await repo_get_module_pdf_file(module_id, pdf_id)
    if pdf is None:
        raise HTTPException(status_code=404, detail="PDF not found")

    if pdf.get("file_data") is None and pdf.get("url"):
        return RedirectResponse(url=pdf["url"])

    disposition = "attachment" if download else "inline"
    safe_filename = quote(pdf["filename"])
    return StreamingResponse(
        BytesIO(pdf["file_data"]),
        media_type=pdf["content_type"],
        headers={
            "Content-Disposition": f"{disposition}; filename*=UTF-8''{safe_filename}",
        },
    )

# Module video endpoint. A module can have no video; uploading replaces the latest video.
@router.get("/modules/{module_id}/video", response_model=ModuleVideoOut)
async def get_module_video(module_id: str) -> ModuleVideoOut:
    video = await repo_get_module_video(module_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found for this module")
    return video

@router.post("/modules/{module_id}/video", response_model=ModuleVideoOut, status_code=201)
async def post_module_video(module_id: str, file: UploadFile = File(...)) -> ModuleVideoOut:
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video files are allowed")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Video file is empty")

    filename = file.filename or "module-video.mp4"
    try:
        upload_result = upload_module_video(BytesIO(file_bytes), filename)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Cloudinary upload failed: {exc}") from exc

    url = upload_result.get("secure_url") or upload_result.get("url")
    if not url:
        raise HTTPException(status_code=502, detail="Cloudinary did not return a video URL")

    return await save_module_video(
        module_id=module_id,
        filename=filename,
        url=url,
        public_id=upload_result.get("public_id"),
        content_type=file.content_type,
        size_bytes=len(file_bytes),
        duration=upload_result.get("duration"),
    )

# Module specific quizzes
@router.get("/modules/{module_id}/quizzes", response_model=ModuleQuizOut)
async def get_module_quiz(module_id: str) -> ModuleQuizOut:
    quiz = await repo_get_module_quiz(module_id)
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found for this module")
    return ModuleQuizOut(**quiz)

@router.post("/modules/{module_id}/quizzes", response_model=ModuleQuizOut, status_code=201)
async def post_module_quiz(module_id: str, quiz: ModuleQuizCreate) -> ModuleQuizOut:
    questions = [q.dict() for q in quiz.questions]
    saved = await repo_save_module_quiz(module_id, quiz.title, questions)
    return ModuleQuizOut(**saved)

@router.get("/modules/{module_id}/quiz-attempts", response_model=List[QuizAttemptOut])
async def get_module_quiz_attempts(module_id: str, student_id: str) -> List[QuizAttemptOut]:
    return await get_attempts_for_student(module_id, student_id)

@router.post("/modules/{module_id}/quiz-attempts", response_model=QuizAttemptOut, status_code=201)
async def post_module_quiz_attempt(module_id: str, attempt: QuizAttemptCreate) -> QuizAttemptOut:
    quiz = await repo_get_module_quiz(module_id)
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found for this module")

    questions = quiz.get("questions", [])
    if len(attempt.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Answer count does not match quiz questions")

    correct = 0
    for index, question in enumerate(questions):
        if attempt.answers[index] == question.get("correctAnswer"):
            correct += 1
    score = round((correct / len(questions)) * 100, 2) if questions else 0
    return await save_quiz_attempt(module_id, attempt.studentId, attempt.answers, score)
