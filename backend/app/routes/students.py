import re

from fastapi import APIRouter, HTTPException

from app.repositories.students import create_student_invite, delete_student_by_id_or_email, login_invited_student
from app.schemas_students import StudentInviteCreate, StudentInviteOut, StudentLoginOut, StudentLoginRequest

router = APIRouter(prefix="/students", tags=["students"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@router.post("/invite", response_model=StudentInviteOut, status_code=201)
async def invite_student(student: StudentInviteCreate) -> StudentInviteOut:
    if not EMAIL_RE.match(student.email.strip().lower()):
        raise HTTPException(status_code=400, detail="Enter a valid student email address")

    return await create_student_invite(
        student.copy(update={"email": student.email.strip().lower()})
    )


@router.post("/login", response_model=StudentLoginOut)
async def login_student(login: StudentLoginRequest) -> StudentLoginOut:
    student = await login_invited_student(login.email.strip().lower(), login.password)
    if student is None:
        raise HTTPException(status_code=401, detail="Invalid invited student email or password")

    return student


@router.delete("/{student_ref}", status_code=204)
async def remove_student(student_ref: str) -> None:
    deleted = await delete_student_by_id_or_email(student_ref)
    if not deleted:
        raise HTTPException(status_code=404, detail="Student not found")
