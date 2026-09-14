from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime, timezone

class MealUnit(str, Enum):
    GRAMS = "g"
    MILLILITERS = "ml"
    PIECE = "piece"
    SERVING = "serving"
    CUP = "cup"
    TABLESPOON = "tbsp"
    TEASPOON = "tsp"



class MealStatus(str, Enum):
    ANALYZED = "analyzed"
    CONFIRMED = "confirmed"


class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"

class Food(BaseModel):
    name: str
    quantity: float
    meal_unit: MealUnit
    calories: float
    protein: float
    fats: float
    carbs: float


class Meal(BaseModel):
    user_id: str
    image_url: str
    foods: list[Food]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
    meal_status: MealStatus
    meal_type: MealType
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
