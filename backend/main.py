from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import close_database, connect_database
from app.routes.courses import router as courses_router

app = FastAPI(title="LearnFlow LMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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

