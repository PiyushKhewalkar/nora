"""Password hashing and bearer tokens.

Deliberately small: hashing, verification, and signing. Anything that knows
about HTTP status codes belongs in the routes, not here.
"""

import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

ALGORITHM = "HS256"
TOKEN_TTL = timedelta(days=30)

# bcrypt refuses anything longer and raises; enforced at the model boundary so
# a long password is a 422, never a 500.
MAX_PASSWORD_BYTES = 72
MIN_PASSWORD_LENGTH = 8


def jwt_secret() -> str:
    """The signing key.

    Read on use rather than at import: a missing key must fail the auth routes
    with a diagnosable error, not prevent the app from starting.
    """
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET is not set; authentication is unavailable.")
    return secret


def jwt_configured() -> bool:
    """For /health. Never returns the key itself."""
    return bool(os.getenv("JWT_SECRET"))


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Constant-time comparison via bcrypt. Never raises on malformed input."""
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": user_id, "iat": now, "exp": now + TOKEN_TTL},
        jwt_secret(),
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> str | None:
    """Return the user id, or None if the token is invalid, expired or forged."""
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None

    subject = payload.get("sub")
    return subject if isinstance(subject, str) else None
