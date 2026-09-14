from fastapi import APIRouter, File, UploadFile, HTTPException
from bson import ObjectId

from database.mongo import db
from models.meals import Meal
from services.storage import upload_image
from services.analyser import analyse_food

ALLOWED = {"image/jpeg", "image/png", "image/webp", "image/heic"}
MAX_BYTES = 10 * 1024 * 1024


router = APIRouter(
    prefix="/meals",
    tags=["Meals"]
)


@router.get("/")
def get_meals():

    meals = list(db.meals.find())

    return {
        "data": meals
    }


@router.get("/{meal_id}")
def get_meal(meal_id: str):

    result = db.meals.find_one({
        "_id": ObjectId(meal_id)
    })

    if result is None:
        return {
            "message": "No meal found"
        }

    return {
        "message": "Meal fetched successfully",
        "data": result
    }


@router.post("/")
def create_meal(meal: Meal):

    meal_data = meal.model_dump()

    result = db.meals.insert_one(meal_data)

    return {
        "message": "Meal added successfully",
        "id": str(result.inserted_id)
    }


@router.put("/{meal_id}")
def update_meal(meal_id: str, meal: Meal):

    meal_data = meal.model_dump()

    result = db.meals.update_one(
        {"_id": ObjectId(meal_id)},
        {"$set": meal_data}
    )

    return {
        "message": "Meal updated successfully"
    }

@router.post("/analyse")
def analyse_meal_image(file: UploadFile = File(...)):
    # 1. if file.content_type not in ALLOWED  -> raise HTTPException(415, ...)
    if file.content_type not in ALLOWED:
        raise HTTPException(
            status_code=415,
            detail="file not supported"
        )

    # 2. if file.size and file.size > MAX_BYTES -> raise HTTPException(413, ...)
    if file.size > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail="file is too big"
        )
    # 3. image_url = upload_image(file.file)
    image_url = upload_image(file.file)
    # 4. foods = analyze_food(image_url)        # stub for now
    foods = analyse_food(image_url)

    # 5. return {"image_url": image_url, "foods": foods}

    return {
        "image_url": image_url, "foods": foods
    }