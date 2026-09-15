from pydantic import BaseModel, EmailStr, Field

from services.auth import MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH
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
    """A stored account. Profile fields are null until onboarding completes,
    and the targets derived from them are null alongside."""
    email: EmailStr
    name: str | None = None
    age: int | None = None
    sex: Sex | None = None
    height: float | None = None
    weight: float | None = None
    goal: Goal | None = None
    activity_level: ActivityLevel | None = None
    daily_calorie_target: int | None = None
    daily_protein_target: int | None = None
    daily_carbs_target: int | None = None
    daily_fat_target: int | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Credentials(BaseModel):
    """Signup and login payload. Never echoed back in any response."""
    email: EmailStr
    # bcrypt raises above 72 bytes, so cap it here: a long password is a 422.
    password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=MAX_PASSWORD_BYTES)


class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    name: str
    age: int
    sex: Sex
    height: float
    weight: float
    goal: Goal
    activity_level: ActivityLevel


class UserUpdate(BaseModel):
    """Editable fields only. Targets are always recomputed, never sent."""
    name: str | None = None
    age: int | None = None
    sex: Sex | None = None
    height: float | None = None
    weight: float | None = None
    goal: Goal | None = None
    activity_level: ActivityLevel | None = None
