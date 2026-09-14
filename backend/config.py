"""App-wide settings read from the environment once, at import."""

import os
from dotenv import load_dotenv

load_dotenv()

# V1 has no auth: every meal belongs to this single user.
DEFAULT_USER_ID = os.getenv("DEFAULT_USER_ID", "default_user")
