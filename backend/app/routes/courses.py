from fastapi import APIRouter, Query

from app.repositories.courses import create_course, list_courses
from app.schemas import CourseCreate, CourseOut

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseOut])
async def get_courses(search: str | None = Query(default=None)) -> list[CourseOut]:
    return await list_courses(search)


@router.post("", response_model=CourseOut, status_code=201)
async def post_course(course: CourseCreate) -> CourseOut:
    return await create_course(course)
