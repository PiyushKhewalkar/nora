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


class AnalyseRequest(BaseModel):
    """Analyse an already-uploaded image."""
    image_url: str


class MealCreate(BaseModel):
    """What a client sends. Totals are never accepted from the client."""
    foods: list[Food]
    meal_type: MealType
    image_url: str | None = None


class Meal(BaseModel):
    """What gets stored. Totals are computed server-side."""
    user_id: str
    image_url: str | None = None
    foods: list[Food]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
    meal_type: MealType
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
