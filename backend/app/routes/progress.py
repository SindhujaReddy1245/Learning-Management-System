from fastapi import APIRouter, HTTPException, Query
from typing import List

from app.repositories.student_module_progress import (
    mark_module_viewed,
    is_module_completed,
    has_completed_all_modules,
)
from app.schemas_progress import ModuleProgressCreate, ModuleProgressOut

router = APIRouter(tags=["progress"])

@router.post("/progress", response_model=ModuleProgressOut, status_code=201)
async def post_progress(progress: ModuleProgressCreate):
    await mark_module_viewed(progress.student_id, progress.module_id)
    # Return basic info
    return ModuleProgressOut(
        student_id=progress.student_id,
        module_id=progress.module_id,
        viewed_at="now"
    )

@router.get("/progress", response_model=List[ModuleProgressOut])
async def get_progress(student_id: str = Query(...), course_id: str = Query(...)):
    # Return all modules the student has viewed in the given course
    # For simplicity we query the DB directly here
    from app.repositories.student_module_progress import get_module_progress_for_student
    rows = await get_module_progress_for_student(student_id, course_id)
    return [ModuleProgressOut(**row) for row in rows]
