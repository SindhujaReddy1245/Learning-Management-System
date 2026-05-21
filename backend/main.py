from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import close_database, connect_database
from app.routes.courses import router as courses_router

app = FastAPI(title="LearnFlow LMS API")

import os

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Support custom frontend URL environment variable
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url.strip().rstrip("/"))

# Support a comma-separated list of allowed origins
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    for origin in allowed_origins_env.split(","):
        clean_origin = origin.strip().rstrip("/")
        if clean_origin and clean_origin not in allowed_origins:
            allowed_origins.append(clean_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses_router, prefix="/api")


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
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

