from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException

from models.user import UserCreate, UserUpdate
from config import DEFAULT_USER_ID
from database.mongo import db

from services.calculators import calculate_targets
from utils.serializers import serialize_doc
from utils.validators import to_object_id


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/")
def create_user(user: UserCreate):
    user_data = user.model_dump()

    # calculate targets
    targets = calculate_targets(
        age=user.age,
        sex=user.sex,
        height=user.height,
        weight=user.weight,
        activity_level=user.activity_level,
        goal=user.goal,
    )

    # create new user data which has targets inside it
    new_user_data = {
        **user_data,
        **targets
    }

    result = db.users.insert_one(new_user_data)

    return {
        "id": str(result.inserted_id),
        "message": "user created successfully"
    }


@router.get("/me")
def get_current_user():
    """The single V1 user, identified by server config rather than by auth."""

    try:
        oid = ObjectId(DEFAULT_USER_ID)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=404,
            detail="No user configured. Set DEFAULT_USER_ID to an existing user id.",
        )

    result = db.users.find_one({"_id": oid})

    if result is None:
        raise HTTPException(status_code=404, detail="Configured user not found")

    return {
        "data": serialize_doc(result),
        "message": "user fetched successfully"
    }


@router.get("/{user_id}")
def get_user(user_id: str):

    result = db.users.find_one({"_id": to_object_id(user_id)})

    if result is None:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "data": serialize_doc(result),
        "message": "user fetched successfully"
    }


@router.put("/{user_id}")
def update_user(user_id: str, user: UserUpdate):

    oid = to_object_id(user_id)
    existing = db.users.find_one({"_id": oid})

    if existing is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Only the fields actually sent.
    changes = user.model_dump(exclude_unset=True)

    # Targets depend on age/sex/height/weight/activity/goal, so recompute them
    # from the merged state rather than trusting whatever the client sent.
    merged = {**existing, **changes}
    targets = calculate_targets(
        age=merged["age"],
        sex=merged["sex"],
        height=merged["height"],
        weight=merged["weight"],
        activity_level=merged["activity_level"],
        goal=merged["goal"],
    )

    db.users.update_one({"_id": oid}, {"$set": {**changes, **targets}})

    return {
        "message": "user updated successfully"
    }