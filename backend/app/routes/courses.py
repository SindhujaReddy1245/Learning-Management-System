from io import BytesIO
from urllib.parse import quote

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

from app.repositories.course_pdfs import (
    get_course_pdf_file,
    list_course_pdfs,
    save_course_pdf,
)
from app.repositories.courses import create_course, list_courses
from app.schemas import CourseCreate, CourseOut, CoursePdfOut

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseOut])
async def get_courses(search: str | None = Query(default=None)) -> list[CourseOut]:
    return await list_courses(search)


@router.post("", response_model=CourseOut, status_code=201)
async def post_course(course: CourseCreate) -> CourseOut:
    return await create_course(course)


@router.get("/{course_id}/pdfs", response_model=list[CoursePdfOut])
async def get_course_pdfs(course_id: str) -> list[CoursePdfOut]:
    return await list_course_pdfs(course_id)


@router.post("/{course_id}/pdfs", response_model=CoursePdfOut, status_code=201)
async def post_course_pdf(course_id: str, file: UploadFile = File(...)) -> CoursePdfOut:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="PDF file is empty")

    filename = file.filename or "course-material.pdf"
    return await save_course_pdf(course_id, filename, file.content_type, file_bytes)


@router.get("/{course_id}/pdfs/{pdf_id}/file")
async def get_course_pdf(course_id: str, pdf_id: str, download: bool = False) -> StreamingResponse:
    pdf = await get_course_pdf_file(course_id, pdf_id)
    if pdf is None:
        raise HTTPException(status_code=404, detail="PDF not found")

    disposition = "attachment" if download else "inline"
    safe_filename = quote(pdf["filename"])
    return StreamingResponse(
        BytesIO(pdf["file_data"]),
        media_type=pdf["content_type"],
        headers={
            "Content-Disposition": f"{disposition}; filename*=UTF-8''{safe_filename}",
        },
    )
