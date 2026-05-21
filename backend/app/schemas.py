from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=180)
    description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=120)
    level: str = Field(default="Beginner", max_length=80)
    duration: str = Field(..., min_length=1, max_length=80)
    details: str = Field(..., min_length=1)
    instructorId: str = Field(..., min_length=1, max_length=180)
    instructor: str = Field(..., min_length=1, max_length=180)


class CourseOut(CourseCreate):
    id: str
    lessonsCount: int = 0
    rating: str = "5.0"
    learnersCount: int = 0


class CoursePdfOut(BaseModel):
    id: str
    courseId: str
    filename: str
    contentType: str = "application/pdf"
    sizeBytes: int
    uploadedAt: str
