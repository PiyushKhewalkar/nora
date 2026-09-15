"""Request-scoped auth. Replaces the single DEFAULT_USER_ID of the pre-auth build."""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from services.auth import decode_token

# auto_error=False so a missing header produces our 401 rather than a 403.
_scheme = HTTPBearer(auto_error=False)


def current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(_scheme),
) -> str:
    """The authenticated user's id, or 401.

    Every data route depends on this, so a request can only ever reach one
    user's rows: the id comes from a signed token, never from the client body
    or a query parameter.
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        user_id = decode_token(credentials.credentials)
    except RuntimeError as exc:
        # JWT_SECRET missing: a configuration fault, not a bad token.
        raise HTTPException(status_code=503, detail=str(exc))

    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user_id
