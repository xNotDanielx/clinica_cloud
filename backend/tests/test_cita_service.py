from decimal import Decimal
from types import SimpleNamespace

import pytest

from app.common.exceptions import ValidationError
from app.services.cita_pricing_service import CitaPricingService


def test_existing_consultation_fee_is_derived_from_totals():
    cita = SimpleNamespace(
        monto_base=Decimal("100.00"),
        monto_descuento=Decimal("10.00"),
        monto_final=Decimal("140.00"),
    )

    result = CitaPricingService.calcular_valor_consulta_existente(
        cita
    )

    assert result == Decimal("50.00")


def test_more_than_two_procedures_is_rejected_before_database_lookup():
    with pytest.raises(ValidationError):
        CitaPricingService.obtener_procedimientos(
            session=None,
            procedimiento_ids=[1, 2, 3],
        )
