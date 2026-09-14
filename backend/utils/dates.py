"""Local-calendar-day helpers.

Mongo stores `created_at` in UTC, but "today" is a question about the user's
local calendar. A meal eaten at 01:00 IST belongs to that IST day even though
its UTC timestamp falls on the previous date. Every day-boundary calculation
goes through here.
"""

import os
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo


def timezone_name() -> str:
    """The configured zone name, cleaned of stray quotes and whitespace."""
    return (os.getenv("TIMEZONE") or "UTC").strip().strip('"').strip("'")


def user_timezone() -> ZoneInfo:
    """The timezone the user's calendar days are measured in.

    Falls back to UTC rather than raising: an unrecognised zone name would
    otherwise 500 every date-aware endpoint with no indication of the cause.
    /health reports the mismatch so a typo is visible instead of fatal.
    """
    try:
        return ZoneInfo(timezone_name())
    except Exception:
        return ZoneInfo("UTC")


def today_local(tz: ZoneInfo | None = None) -> date:
    """Today's date in the user's timezone, not UTC."""
    tz = tz or user_timezone()
    return datetime.now(timezone.utc).astimezone(tz).date()


def day_bounds(day: date, tz: ZoneInfo | None = None) -> tuple[datetime, datetime]:
    """UTC [start, end) covering one local calendar day, for a Mongo range query."""
    tz = tz or user_timezone()
    start_local = datetime.combine(day, time.min, tzinfo=tz)
    end_local = start_local + timedelta(days=1)
    return start_local.astimezone(timezone.utc), end_local.astimezone(timezone.utc)
