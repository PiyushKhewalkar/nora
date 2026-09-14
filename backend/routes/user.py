from fastapi import APIRouter

from models.user import User, UserCreate
from database.mongo import db

from services.calculators import calculate_targets


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


@router.get("/{user_id}")
def get_user(user_id: str):

    result = db.users.find_one({"id": user_id})

    if result is None:
        return {
            "message": "No user found"
        }

    return {
        "data": result,
        "message": "user fetched successfully"
    }


@router.put("/{user_id}")
def update_user(user_id: str, user: User):

    user_data = user.model_dump()

    result = db.users.update_one(
        {"id": user_id},
        {"$set": user_data}
    )

    return {
        "message": "user updated successfully"
    }