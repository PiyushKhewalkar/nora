import os

from fastapi import FastAPI
from config import ALLOWED_ORIGINS
from database.mongo import db
from routes.user import router as user_router
from routes.meal import router as meal_router
from routes.summary import router as summary_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_headers=["*"],
    allow_methods=["*"],
)

app.include_router(user_router)
app.include_router(meal_router)
app.include_router(summary_router)


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/health/db")
def database_health():
    """Report why the database is unreachable without exposing credentials."""
    try:
        db.command("ping")
        return {"database": "connected"}
    except Exception as exc:
        return {
            "database": "unreachable",
            "error": type(exc).__name__,
            # Distinguishes a missing variable from a network block. The value
            # itself is never returned.
            "mongodb_uri_configured": bool(os.getenv("MONGODB_URI")),
        }