import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta, time
from decimal import Decimal
from threading import Barrier
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import Base, engine
import app.models  # noqa: F401
from app.models.procedimiento import Procedimiento
from app.common.exceptions import ConflictError, ValidationError, NotFoundError
from app.services.booking_policy import booking_limits, validate_public_slot
from app.services.cita_service import CitaService
from app.schemas.cita import CitaPublicaOut, CitaUpdate


@unittest.skipUnless(engine.dialect.name == "postgresql", "Requires PostgreSQL: set DATABASE_URL to a test database")
class BookingTests(unittest.TestCase):
    def setUp(self):
        # Every test uses its own schema; public application records are untouched.
        self.schema = "booking_test_" + uuid4().hex
        with engine.begin() as connection:
            connection.execute(text(f'CREATE SCHEMA "{self.schema}"'))
        self.db_engine = engine.execution_options(schema_translate_map={"public": self.schema})
        Base.metadata.create_all(self.db_engine)
        self.day = booking_limits()[0] + timedelta(days=3)
        with Session(self.db_engine) as db:
            procedure = Procedimiento(nombre="Prueba", descripcion="Datos sintéticos", precio=Decimal("0"))
            db.add(procedure)
            db.commit()
            self.procedure_id = procedure.id

    def tearDown(self):
        with engine.begin() as connection:
            connection.execute(text(f'DROP SCHEMA "{self.schema}" CASCADE'))

    def book(self, db, hour="09:00", identity="10000", day=None):
        cita = CitaService.crear_cita_publica(
            db, nombre_completo="Paciente Prueba", tipo_identificacion="cedula_chilena",
            identificacion=identity, telefono="+56000000000", email="prueba@example.com",
            direccion="Direccion ficticia", sexo="femenino", fecha_programada=day or self.day,
            hora=hour, procedimiento_ids=[self.procedure_id],
        )
        db.commit()
        return cita

    def test_pending_blocks_slot_and_receipt_has_no_private_fields(self):
        with Session(self.db_engine) as db:
            cita = self.book(db)
            self.assertEqual(cita.estado, "pendiente_aprobacion")
            self.assertNotIn("09:00", CitaService.obtener_horarios_disponibles(db, self.day))
            self.assertEqual(set(CitaPublicaOut.model_validate(cita).model_dump()), {"id", "estado", "fecha_programada", "hora_inicio", "codigo_seguimiento"})
            with self.assertRaises(ConflictError):
                self.book(db, identity="20000")

    def test_approval_keeps_slot_and_rejection_allows_rebooking(self):
        with Session(self.db_engine) as db:
            cita = self.book(db)
            CitaService.autorizar_cita(db, cita.id)
            db.commit()
            self.assertNotIn("09:00", CitaService.obtener_horarios_disponibles(db, self.day))
            CitaService.rechazar_cita(db, cita.id)
            db.commit()
            self.assertIn("09:00", CitaService.obtener_horarios_disponibles(db, self.day))
            replacement = self.book(db, identity="20000")
            self.assertNotEqual(replacement.id, cita.id)
            with self.assertRaises(ConflictError):
                CitaService.autorizar_cita(db, cita.id)
            db.rollback()

    def test_deleted_cita_releases_slot(self):
        with Session(self.db_engine) as db:
            cita = self.book(db)
            CitaService.eliminar_cita(db, cita.id)
            db.commit()
            self.assertIn("09:00", CitaService.obtener_horarios_disponibles(db, self.day))
            self.book(db, identity="20000")

    def test_public_date_and_time_validation(self):
        minimum, maximum = booking_limits()
        for day, hour in [(minimum - timedelta(days=1), "09:00"), (maximum + timedelta(days=1), "09:00"), (minimum, "09:30"), (minimum, "23:00")]:
            with self.assertRaises(ValidationError):
                validate_public_slot(day, hour)
        validate_public_slot(minimum, "09:00")
        validate_public_slot(maximum, "18:00")

    def test_partial_overlaps_are_blocked(self):
        with Session(self.db_engine) as db:
            cita = self.book(db)
            CitaService.actualizar_cita(db, cita.id, CitaUpdate(hora_inicio=time(9, 30), hora_fin=time(10, 30)))
            db.commit()
            slots = CitaService.obtener_horarios_disponibles(db, self.day)
            self.assertNotIn("09:00", slots)
            self.assertNotIn("10:00", slots)
            self.assertIn("11:00", slots)

    def test_simultaneous_requests_have_one_winner(self):
        barrier = Barrier(2)
        def request(identity):
            with Session(self.db_engine) as db:
                barrier.wait(timeout=5)
                try:
                    self.book(db, identity=identity)
                    return "created"
                except ConflictError:
                    return "conflict"
        with ThreadPoolExecutor(max_workers=2) as workers:
            results = list(workers.map(request, ["30000", "40000"]))
        self.assertCountEqual(results, ["created", "conflict"])

    def test_tracking_code_is_private_and_follows_administrative_status(self):
        with Session(self.db_engine) as db:
            cita = self.book(db)
            code = cita.codigo_seguimiento
            self.assertEqual(len(code), 43)
            self.assertEqual(len(cita.seguimiento_hash), 64)
            self.assertNotEqual(cita.seguimiento_hash, code)
            result = CitaService.consultar_seguimiento(db, code)
            self.assertEqual(set(result), {"estado", "fecha_programada", "hora_inicio", "zona_horaria"})
            self.assertEqual(result["estado"], "pendiente_aprobacion")
            CitaService.autorizar_cita(db, cita.id)
            db.commit()
            self.assertEqual(CitaService.consultar_seguimiento(db, code)["estado"], "aprobada")
            CitaService.rechazar_cita(db, cita.id)
            db.commit()
            self.assertEqual(CitaService.consultar_seguimiento(db, code)["estado"], "cancelada")
            replacement = self.book(db, identity="20000")
            self.assertNotEqual(code, replacement.codigo_seguimiento)
            self.assertEqual(CitaService.consultar_seguimiento(db, code)["estado"], "cancelada")
            CitaService.eliminar_cita(db, replacement.id)
            db.commit()
            self.assertEqual(CitaService.consultar_seguimiento(db, replacement.codigo_seguimiento)["estado"], "cancelada")

    def test_tracking_rejects_ids_and_unknown_codes(self):
        with Session(self.db_engine) as db:
            cita = self.book(db)
            for code in [str(cita.id), "A" * 43, cita.id_paciente]:
                with self.assertRaises(NotFoundError):
                    CitaService.consultar_seguimiento(db, code)


if __name__ == "__main__":
    unittest.main()
