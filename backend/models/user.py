from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime, timezone

class Sex(str, Enum):
    MALE = "male"
    FEMALE = "female"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    EXTRA_ACTIVE = "extra_active"

class Goal(str, Enum):
    LOSE_WEIGHT = "lose_weight"
    MAINTAIN_WEIGHT = "maintain_weight"
    GAIN_WEIGHT = "gain_weight"

class User(BaseModel):
    id: str
    name: str
    age: int
    sex: Sex
    height: float
    weight: float
    goal: Goal
    activity_level: ActivityLevel
    daily_calorie_target: int
    daily_protein_target: int
    daily_carbs_target: int
    daily_fat_target: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserCreate(BaseModel):
    name: str
    age: int
    sex: Sex
    height: float
    weight: float
    goal: Goal
    activity_level: ActivityLevel
