from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query

from dependencies import current_user_id
from database.mongo import db
from models.meals import AnalyseRequest, MealCreate
from services.storage import upload_image
from services.analyser import analyse_food
from services.calculators import calculate_totals
from utils.serializers import serialize_doc, serialize_docs
from utils.validators import to_object_id
from utils.dates import day_bounds, today_local, user_timezone
from urllib.parse import urlparse

ALLOWED = {"image/jpeg", "image/png", "image/webp", "image/heic"}
MAX_BYTES = 10 * 1024 * 1024


router = APIRouter(
    prefix="/meals",
    tags=["Meals"]
)


@router.get("/")
def get_meals(
    day: date | None = Query(None, alias="date"),
    user_id: str = Depends(current_user_id),
):
    """List this user's meals for one local calendar day, newest first.

    With no `date`, defaults to today in the configured timezone - the same
    rule /summary/ applies. Both endpoints must agree on what "no date" means,
    or a screen showing the list and the totals together will contradict
    itself: previously this returned every meal ever logged, so a meal from a
    past day appeared in the list while counting toward nothing.
    """

    tz = user_timezone()
    start, end = day_bounds(day or today_local(tz), tz)

    query = {
        "user_id": user_id,
        "created_at": {"$gte": start, "$lt": end},
    }

    meals = db.meals.find(query).sort("created_at", -1)

    return {
        "data": serialize_docs(meals)
    }


@router.get("/{meal_id}")
def get_meal(meal_id: str, user_id: str = Depends(current_user_id)):

    # Owner is part of the filter: a valid id belonging to someone else must
    # read as "not found", not as someone else's meal.
    result = db.meals.find_one({"_id": to_object_id(meal_id), "user_id": user_id})

    if result is None:
        raise HTTPException(status_code=404, detail="Meal not found")

    return {
        "message": "Meal fetched successfully",
        "data": serialize_doc(result)
    }


@router.post("/")
def create_meal(meal: MealCreate, user_id: str = Depends(current_user_id)):

    # Totals are computed here, never taken from the client.
    meal_data = {
        **meal.model_dump(),
        **calculate_totals(meal.foods),
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc),
    }

    result = db.meals.insert_one(meal_data)

    return {
        "message": "Meal added successfully",
        "id": str(result.inserted_id)
    }


@router.put("/{meal_id}")
def update_meal(meal_id: str, meal: MealCreate, user_id: str = Depends(current_user_id)):

    # Same rule as create: recompute rather than trust the client.
    meal_data = {
        **meal.model_dump(),
        **calculate_totals(meal.foods),
    }

    result = db.meals.update_one(
        {"_id": to_object_id(meal_id), "user_id": user_id},
        {"$set": meal_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Meal not found")

    return {
        "message": "Meal updated successfully"
    }


@router.delete("/{meal_id}")
def delete_meal(meal_id: str, user_id: str = Depends(current_user_id)):

    result = db.meals.delete_one({"_id": to_object_id(meal_id), "user_id": user_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meal not found")

    return {
        "message": "Meal deleted successfully"
    }

@router.post("/upload")
def upload_meal_image(
    file: UploadFile = File(...),
    user_id: str = Depends(current_user_id),
):
    """Phase 1: store the photo. Fast, and reports real upload progress to the client."""

    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=415, detail="file not supported")

    if file.size and file.size > MAX_BYTES:
        raise HTTPException(status_code=413, detail="file is too big")

    return {
        "image_url": upload_image(file.file)
    }


@router.post("/analyse")
def analyse_meal_image(body: AnalyseRequest, user_id: str = Depends(current_user_id)):
    """Phase 2: estimate the foods in an already-uploaded photo. Slow (10-20s)."""

    # The model fetches this URL, so only accept images we stored ourselves.
    if urlparse(body.image_url).hostname != "res.cloudinary.com":
        raise HTTPException(status_code=400, detail="image_url must be an uploaded meal image")

    return {
        "image_url": body.image_url,
        "foods": analyse_food(body.image_url),
    }
