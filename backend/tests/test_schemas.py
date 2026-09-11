from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas.administrador import AdministradorCreate
from app.schemas.cita import CitaPublicaRequest


def _public_payload():
    return {
        "nombre_completo": "Paciente Prueba",
        "tipo_identificacion": "cedula_chilena",
        "identificacion": "123456",
        "telefono": "+56912345678",
        "email": "paciente@example.com",
        "direccion": "Dirección de prueba",
        "sexo": "femenino",
        "fecha_programada": date.today(),
        "hora": "10:00",
        "procedimiento_ids": [1],
        "nota": None,
    }


def test_public_appointment_accepts_one_or_two_procedures():
    one = CitaPublicaRequest(**_public_payload())

    payload = _public_payload()
    payload["procedimiento_ids"] = [1, 2]
    two = CitaPublicaRequest(**payload)

    assert one.procedimiento_ids == [1]
    assert two.procedimiento_ids == [1, 2]


def test_public_appointment_rejects_more_than_two_procedures():
    payload = _public_payload()
    payload["procedimiento_ids"] = [1, 2, 3]

    with pytest.raises(ValidationError):
        CitaPublicaRequest(**payload)


def test_public_appointment_ignores_legacy_client_consultation_value():
    payload = _public_payload()
    payload["valor_consulta"] = 999999

    appointment = CitaPublicaRequest(**payload)

    assert not hasattr(appointment, "valor_consulta")


def test_admin_password_requires_twelve_characters():
    with pytest.raises(ValidationError):
        AdministradorCreate(usuario="admin", contrasena="corta")
