from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Database connection utilities
from app.database import close_database, connect_database

from app.routes.courses import router as courses_router
from app.routes.modules import router as modules_router
from app.routes.quizzes import router as quizzes_router
from app.routes.students import router as students_router
from app.routes.progress import router as progress_router
from app.routes.certificates import router as certificates_router

app = FastAPI(title="LearnFlow LMS API")

# CORS configuration
allowed_origins = ["*"]
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    for origin in allowed_origins_env.split(","):
        clean_origin = origin.strip().rstrip("/")
        if clean_origin and clean_origin not in allowed_origins:
            allowed_origins.append(clean_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses_router, prefix="/api")
app.include_router(modules_router, prefix="/api")
app.include_router(quizzes_router, prefix="/api")
app.include_router(students_router, prefix="/api")
app.include_router(progress_router, prefix="/api")
app.include_router(certificates_router, prefix="/api")

@app.on_event("startup")
async def startup() -> None:
    await connect_database()

@app.on_event("shutdown")
async def shutdown() -> None:
    await close_database()

@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "LearnFlow LMS API is running",
        "health": "/health",
        "courses": "/api/courses",
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
