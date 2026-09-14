from fastapi import FastAPI
from database.mongo import db
from routes.user import router as user_router
from routes.meal import router as meal_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # CRA / Next dev server
    ], allow_credentials=False, allow_headers=["*"], allow_methods=["*"])

app.include_router(user_router)
app.include_router(meal_router)


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/health/db")
def database_health():
    db.command("ping")
    return {"database": "connected"}