"""Request-level validation helpers. These know about HTTP; services do not."""

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException


def to_object_id(value: str) -> ObjectId:
    """Parse a path parameter into an ObjectId, or 400 if it is malformed."""
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail=f"Invalid id: {value}")
