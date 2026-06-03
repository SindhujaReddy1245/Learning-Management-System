from pydantic import BaseModel, Field

class ModuleProgressCreate(BaseModel):
    student_id: str = Field(..., min_length=1)
    module_id: str = Field(..., min_length=1)

class ModuleProgressOut(BaseModel):
    student_id: str
    module_id: str
    viewed_at: str
