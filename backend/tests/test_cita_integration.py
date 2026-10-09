from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.db.database import Base
from app.models.paciente import Paciente
from app.models.procedimiento import Procedimiento
from app.schemas.cita import CitaUpdate
from app.services.cita_service import CitaService


def _session():
    engine = create_engine("sqlite+pysqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
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
            fecha_programada=date.today() + timedelta(days=3),
            hora="10:00",
            procedimiento_ids=[procedimiento.id],
        )
        session.commit()

        assert "10:00" not in CitaService.obtener_horarios_disponibles(
            session,
            date.today() + timedelta(days=3),
        )
        assert cita.monto_final == Decimal("100.00")

        CitaService.rechazar_cita(session, cita.id)
        session.commit()

        assert "10:00" in CitaService.obtener_horarios_disponibles(
            session,
            date.today() + timedelta(days=3),
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
            fecha_programada=date.today() + timedelta(days=3),
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

def test_public_receipt_tracking_and_admin_auth_contract():
    from fastapi.testclient import TestClient
    from app.main import create_app
    from app.routes.deps import get_db

    session = _session()
    procedure = Procedimiento(nombre="Prueba", descripcion="Prueba", precio=Decimal("0"), activo=True)
    session.add(procedure)
    session.commit()
    app = create_app()
    app.dependency_overrides[get_db] = lambda: session
    client = TestClient(app)
    try:
        response = client.post("/citas/publica", json={
            "nombre_completo": "Paciente Prueba", "tipo_identificacion": "cedula_chilena",
            "identificacion": "9001", "telefono": "123456", "email": "test@example.com",
            "direccion": "Prueba", "sexo": "femenino",
            "fecha_programada": (date.today() + timedelta(days=3)).isoformat(),
            "hora": "10:00", "procedimiento_ids": [procedure.id],
            "valor_consulta": "99999"
        })
        assert response.status_code == 201, response.text
        assert response.headers["cache-control"] == "no-store"
        receipt = response.json()
        assert set(receipt) == {"id", "estado", "fecha_programada", "hora_inicio", "codigo_seguimiento"}
        assert len(receipt["codigo_seguimiento"]) == 43
        tracked = client.post("/citas/seguimiento", json={"codigo": receipt["codigo_seguimiento"]})
        assert tracked.status_code == 200
        assert tracked.headers["cache-control"] == "no-store"
        assert set(tracked.json()) == {"estado", "fecha_programada", "hora_inicio", "zona_horaria"}
        assert client.post("/citas/seguimiento", json={"codigo": "A" * 43}).status_code == 404
        assert client.post("/citas/seguimiento", json={"codigo": str(receipt["id"])}).status_code == 422
        assert client.get("/citas/todas").status_code == 401
        assert client.post("/asistente/admin/chat", json={"message": "Resumen", "history": []}).status_code == 401
        calendar = client.get("/citas/calendario").json()
        assert "zona_horaria" in calendar
        day = receipt["fecha_programada"]
        assert "10:00" not in calendar["dias"][day]
        CitaService.autorizar_cita(session, receipt["id"])
        session.commit()
        assert client.post("/citas/seguimiento", json={"codigo": receipt["codigo_seguimiento"]}).json()["estado"] == "aprobada"
        CitaService.rechazar_cita(session, receipt["id"])
        session.commit()
        assert client.post("/citas/seguimiento", json={"codigo": receipt["codigo_seguimiento"]}).json()["estado"] == "cancelada"
        assert "10:00" in client.get("/citas/calendario").json()["dias"][day]
    finally:
        app.dependency_overrides.clear()
        session.close()
