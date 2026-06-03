from pydantic import BaseModel
from datetime import datetime

class CertificateCreate(BaseModel):
    student_id: str
    course_id: str
    student_name: str | None = None
    student_email: str | None = None

class CertificateOut(BaseModel):
    id: str
    student_id: str
    course_id: str
    url: str
    issued_at: datetime
