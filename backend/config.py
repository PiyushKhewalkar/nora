"""App-wide settings read from the environment once, at import."""

import os
from dotenv import load_dotenv

load_dotenv()

# V1 has no auth: every meal belongs to this single user.
DEFAULT_USER_ID = os.getenv("DEFAULT_USER_ID", "default_user")

# Browser origins allowed to call this API. Comma-separated in the environment;
# the deployed frontend's URL must be listed here or requests fail CORS.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")
    if origin.strip()
]
