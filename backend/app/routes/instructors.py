from fastapi import APIRouter, HTTPException, Depends

from app.repositories.students import delete_student
from app.repositories.instructors import get_instructor, list_instructors
from app.schemas import InstructorOut, InstructorCreate

router = APIRouter(prefix="/instructors", tags=["instructors"])

@router.get("", response_model=list[InstructorOut])
async def list_all():
    return await list_instructors()

@router.get("/{instructor_id}", response_model=InstructorOut)
async def get_one(instructor_id: str):
    instructor = await get_instructor(instructor_id)
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return instructor

# Delete a student from an instructor's dashboard
@router.delete("/students/{student_id}", status_code=204)
async def delete_student_endpoint(student_id: str):
    await delete_student(student_id)
    return None
