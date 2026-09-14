from fastapi import APIRouter
from bson import ObjectId

from database.mongo import db
from models.meals import Meal


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