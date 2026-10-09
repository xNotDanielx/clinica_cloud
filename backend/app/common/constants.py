from datetime import time
from decimal import Decimal


MAX_PROCEDURES_PER_APPOINTMENT = 2
PUBLIC_CONSULTATION_FEE = Decimal("0.00")

APPOINTMENT_SLOTS: tuple[tuple[str, time, time], ...] = tuple(
    (
        f"{hour:02d}:00",
        time(hour, 0),
        time(hour + 1, 0),
    )
    for hour in range(9, 19)
)

APPOINTMENT_SLOT_LABELS = frozenset(label for label, _, _ in APPOINTMENT_SLOTS)
