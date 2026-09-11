from datetime import date
from decimal import Decimal

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401
from app.db.database import Base
from app.models.paciente import Paciente
from app.models.procedimiento import Procedimiento
from app.schemas.cita import CitaUpdate
from app.services.cita_service import CitaService


def _session():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    with engine.begin() as connection:
        connection.execute(text("ATTACH DATABASE ':memory:' AS public"))
        Base.metadata.create_all(bind=connection)
    return sessionmaker(bind=engine)()


def test_create_and_cancel_appointment_releases_slot():
    session = _session()
    try:
        paciente = Paciente(
            identificacion="123",
            tipo_identificacion="cedula_chilena",
            nombre_completo="Paciente",
            telefono="123456",
            email="paciente@example.com",
            direccion="Dirección",
            sexo="femenino",
            activo=True,
        )
        procedimiento = Procedimiento(
            nombre="Procedimiento",
            descripcion="Descripción",
            precio=Decimal("100.00"),
            activo=True,
        )
        session.add_all([paciente, procedimiento])
        session.commit()

        cita = CitaService.crear_cita_publica(
            session,
            nombre_completo="Paciente",
            tipo_identificacion="cedula_chilena",
            identificacion="123",
            telefono="123456",
            email="paciente@example.com",
            direccion="Dirección",
            sexo="femenino",
            fecha_programada=date.today(),
            hora="10:00",
            procedimiento_ids=[procedimiento.id],
        )
        session.commit()

        assert "10:00" not in CitaService.obtener_horarios_disponibles(
            session,
            date.today(),
        )
        assert cita.monto_final == Decimal("100.00")

        CitaService.rechazar_cita(session, cita.id)
        session.commit()

        assert "10:00" in CitaService.obtener_horarios_disponibles(
            session,
            date.today(),
        )
    finally:
        session.close()


def test_update_keeps_existing_consultation_fee_when_not_sent_again():
    session = _session()
    try:
        paciente = Paciente(
            identificacion="456",
            tipo_identificacion="cedula_chilena",
            nombre_completo="Paciente",
            telefono="123456",
            email="paciente@example.com",
            direccion="Dirección",
            sexo="masculino",
            activo=True,
        )
        p1 = Procedimiento(
            nombre="P1",
            descripcion="P1",
            precio=Decimal("100.00"),
            activo=True,
        )
        p2 = Procedimiento(
            nombre="P2",
            descripcion="P2",
            precio=Decimal("200.00"),
            activo=True,
        )
        session.add_all([paciente, p1, p2])
        session.commit()

        cita = CitaService.crear_cita(
            session,
            id_paciente=paciente.identificacion,
            fecha_programada=date.today(),
            hora_inicio=__import__("datetime").time(12, 0),
            hora_fin=__import__("datetime").time(13, 0),
            procedimiento_ids=[p1.id],
            valor_consulta=Decimal("50.00"),
        )
        session.commit()

        updated = CitaService.actualizar_cita(
            session,
            cita.id,
            CitaUpdate(procedimiento_ids=[p2.id]),
        )
        session.commit()

        assert updated.monto_base == Decimal("200.00")
        assert updated.monto_final == Decimal("250.00")
    finally:
        session.close()
