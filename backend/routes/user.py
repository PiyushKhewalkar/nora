from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database.mongo import db
from dependencies import current_user_id
from models.user import UserUpdate
from services.calculators import calculate_targets
from utils.serializers import serialize_doc
from utils.validators import to_object_id

router = APIRouter(prefix="/users", tags=["Users"])

# Everything needed before targets can be derived.
PROFILE_FIELDS = ("age", "sex", "height", "weight", "goal", "activity_level")

# Never leaves the server.
PRIVATE_FIELDS = ("password_hash",)


def _public(user: dict) -> dict:
    """Strip secrets before a user document becomes a response."""
    safe = {k: v for k, v in user.items() if k not in PRIVATE_FIELDS}
    return serialize_doc(safe)


def _load(user_id: str) -> dict:
    user = db.users.find_one({"_id": to_object_id(user_id)})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/me")
def get_current_user(user_id: str = Depends(current_user_id)):
    """The authenticated user.

    There is deliberately no `GET /users/{id}`: with an id in the path, any
    logged-in user could read any other by guessing one. The only addressable
    user is the one the token names.
    """
    return {
        "data": _public(_load(user_id)),
        "message": "user fetched successfully",
    }


@router.put("/me")
def update_current_user(user: UserUpdate, user_id: str = Depends(current_user_id)):
    """Update the profile and recompute the derived targets."""
    existing = _load(user_id)

    changes = user.model_dump(exclude_unset=True)
    merged = {**existing, **changes}

    update: dict = dict(changes)

    # Targets can only be derived once the whole profile is present. A partially
    # filled profile keeps null targets, which the clients already handle.
    if all(merged.get(field) is not None for field in PROFILE_FIELDS):
        update.update(
            calculate_targets(
                age=merged["age"],
                sex=merged["sex"],
                height=merged["height"],
                weight=merged["weight"],
                activity_level=merged["activity_level"],
                goal=merged["goal"],
            )
        )

    if update:
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update})

    return {"message": "user updated successfully"}
