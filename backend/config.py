"""App-wide settings read from the environment once, at import."""

import os
from dotenv import load_dotenv

load_dotenv()


# Browser origins allowed to call this API. Comma-separated in the environment;
# the deployed frontend's URL must be listed here or requests fail CORS.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")
    if origin.strip()
]
