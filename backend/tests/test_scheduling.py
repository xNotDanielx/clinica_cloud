from datetime import date, timedelta

import pytest

from app.common.exceptions import ValidationError
from app.services.cita_scheduling_service import CitaSchedulingService


def test_public_slot_rejects_past_dates():
    with pytest.raises(ValidationError):
        CitaSchedulingService.validar_slot_publico(
            date.today() - timedelta(days=1),
            "10:00",
        )


def test_public_slot_rejects_arbitrary_times():
    with pytest.raises(ValidationError):
        CitaSchedulingService.validar_slot_publico(
            date.today(),
            "10:30",
        )


def test_public_slot_returns_expected_interval():
    inicio, fin = CitaSchedulingService.validar_slot_publico(
        date.today(),
        "10:00",
    )

    assert inicio.hour == 10
    assert fin.hour == 11
