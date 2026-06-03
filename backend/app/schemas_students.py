from pydantic import BaseModel, Field


class StudentInviteCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=180)
    college: str = Field(..., min_length=1, max_length=180)
    email: str = Field(..., min_length=3, max_length=180)
    courseId: str | None = Field(default=None, max_length=180)
    instructorId: str = Field(..., min_length=1, max_length=180)
    instructorEmail: str = Field(..., min_length=3, max_length=180)


class StudentInviteOut(BaseModel):
    id: str
    name: str
    college: str
    email: str
    courseId: str | None = None
    role: str = "student"
    emailSent: bool = False
    generatedPassword: str | None = None


class StudentLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=180)
    password: str = Field(..., min_length=6, max_length=180)


class StudentLoginOut(BaseModel):
    uid: str
    name: str
    college: str | None = None
    email: str
    role: str = "student"
