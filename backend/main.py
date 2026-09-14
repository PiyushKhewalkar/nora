from fastapi import FastAPI
from database.mongo import db
from routes.user import router as user_router
from routes.meal import router as meal_router

app = FastAPI()

app.include_router(user_router)
app.include_router(meal_router)


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/health/db")
def database_health():
    db.command("ping")
    return {"database": "connected"}