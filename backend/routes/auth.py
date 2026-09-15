from bson import ObjectId
from fastapi import APIRouter, HTTPException

from database.mongo import db
from models.user import AuthToken, Credentials
from services.auth import create_token, hash_password, jwt_secret, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])


def _require_signing_key() -> None:
    """Fail before writing anything.

    Signup inserts the account and then mints a token. If minting fails in
    between, the row survives with no way to log into it and a retry collides
    with the unique email index. Checking first keeps signup all-or-nothing.
    """
    try:
        jwt_secret()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


def _issue(user_id: str) -> AuthToken:
    """Mint a token, turning a missing signing key into a diagnosable 503.

    Without this, an unset JWT_SECRET surfaces as a bare 500 that looks like a
    code fault rather than the configuration problem it is.
    """
    try:
        return AuthToken(access_token=create_token(user_id))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


def _normalise(email: str) -> str:
    """Emails are case-insensitive for lookup; store and compare lowercased."""
    return email.strip().lower()


@router.post("/signup", response_model=AuthToken)
def signup(credentials: Credentials):
    _require_signing_key()
    email = _normalise(credentials.email)

    if db.users.find_one({"email": email}) is not None:
        raise HTTPException(status_code=409, detail="That email is already registered")

    result = db.users.insert_one({
        "email": email,
        "password_hash": hash_password(credentials.password),
        # Profile is filled in afterwards; targets stay null until then.
        "name": None, "age": None, "sex": None, "height": None, "weight": None,
        "goal": None, "activity_level": None,
        "daily_calorie_target": None, "daily_protein_target": None,
        "daily_carbs_target": None, "daily_fat_target": None,
    })

    return _issue(str(result.inserted_id))


@router.post("/login", response_model=AuthToken)
def login(credentials: Credentials):
    user = db.users.find_one({"email": _normalise(credentials.email)})

    # One message for both "no such email" and "wrong password": distinguishing
    # them tells an attacker which addresses are registered.
    if user is None or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    return _issue(str(user["_id"]))
