from datetime import date

from fastapi import APIRouter, HTTPException, Query

from bson import ObjectId
from bson.errors import InvalidId

from config import DEFAULT_USER_ID
from database.mongo import db
from utils.dates import day_bounds, today_local, user_timezone

router = APIRouter(
    prefix="/summary",
    tags=["Summary"]
)

MACROS = ("calories", "protein", "carbs", "fats")


def _find_user(user_id: str):
    """Look up the configured user. Returns None if unset or not found."""
    try:
        return db.users.find_one({"_id": ObjectId(user_id)})
    except (InvalidId, TypeError):
        return None


@router.get("/")
def get_summary(day: date | None = Query(None, alias="date")):
    """Consumed vs target vs remaining for one local calendar day."""

    tz = user_timezone()
    target_day = day or today_local(tz)
    start, end = day_bounds(target_day, tz)

    meals = list(db.meals.find({
        "user_id": DEFAULT_USER_ID,
        "created_at": {"$gte": start, "$lt": end},
    }))

    consumed = {
        m: round(sum(meal.get(f"total_{m}", 0) for meal in meals), 1)
        for m in MACROS
    }

    user = _find_user(DEFAULT_USER_ID)

    if user is None:
        # No user configured yet: report intake, but we cannot compare it
        # to anything. The client should treat null targets as "not set up".
        targets = None
        remaining = None
    else:
        targets = {
            "calories": user["daily_calorie_target"],
            "protein": user["daily_protein_target"],
            "carbs": user["daily_carbs_target"],
            "fats": user["daily_fat_target"],
        }
        remaining = {m: round(targets[m] - consumed[m], 1) for m in MACROS}

    return {
        "date": target_day.isoformat(),
        "timezone": str(tz),
        "meal_count": len(meals),
        "consumed": consumed,
        "targets": targets,
        "remaining": remaining,
    }
