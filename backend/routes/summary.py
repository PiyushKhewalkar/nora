from datetime import date

from fastapi import APIRouter, Depends, Query

from bson import ObjectId
from bson.errors import InvalidId

from dependencies import current_user_id
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
def get_summary(
    day: date | None = Query(None, alias="date"),
    user_id: str = Depends(current_user_id),
):
    """Consumed vs target vs remaining for one local calendar day."""

    tz = user_timezone()
    target_day = day or today_local(tz)
    start, end = day_bounds(target_day, tz)

    meals = list(db.meals.find({
        "user_id": user_id,
        "created_at": {"$gte": start, "$lt": end},
    }))

    consumed = {
        m: round(sum(meal.get(f"total_{m}", 0) for meal in meals), 1)
        for m in MACROS
    }

    user = _find_user(user_id)

    # A signed-up account has no profile until onboarding completes, so the
    # targets are null even though the user exists. Both cases report intake
    # and null targets; the clients already render that state.
    if user is None or user.get("daily_calorie_target") is None:
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
