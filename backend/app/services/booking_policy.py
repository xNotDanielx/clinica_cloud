from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from app.common.exceptions import ValidationError

TIMEZONE = "America/Santiago"
SLOT_HOURS = tuple(f"{hour:02d}:00" for hour in range(9, 19))


def booking_limits():
    today = datetime.now(ZoneInfo(TIMEZONE)).date()
    return today + timedelta(days=2), today + timedelta(days=90)


def validate_public_slot(day: date, hour: str):
    minimum, maximum = booking_limits()
    if not minimum <= day <= maximum:
        raise ValidationError("La fecha debe estar entre 2 y 90 días desde hoy.")
    if hour not in SLOT_HOURS:
        raise ValidationError("Selecciona un horario de valoración disponible.")
