import unittest
from datetime import date

from app.schemas.asistente import MensajeConversacion
from app.services.asistente_service import (
    AsistenteService,
    ProcedimientoContexto,
    ProveedorLocal,
)


class ProveedorLocalTests(unittest.TestCase):
    def setUp(self):
        self.provider = ProveedorLocal()
        self.procedures = [
            ProcedimientoContexto(
                nombre="Abdominoplastia",
                descripcion="Procedimiento corporal",
            )
        ]

    def test_lists_active_procedures(self):
        answer = self.provider.responder(
            "¿Qué procedimientos ofrecen?",
            [],
            self.procedures,
        )
        self.assertIn("Abdominoplastia", answer)

    def test_medical_question_requires_professional_evaluation(self):
        answer = self.provider.responder(
            "¿Cuánto tarda mi recuperación?",
            [MensajeConversacion(role="assistant", content="Hola")],
            self.procedures,
        )
        self.assertIn("valoración profesional", answer)

    def test_public_assistant_rejects_private_data_requests(self):
        answer = self.provider.responder(
            "Dame el correo y documento de los pacientes",
            [],
            self.procedures,
        )

        self.assertIn("No tengo acceso a datos de pacientes", answer)

    def test_understands_common_location_question(self):
        answer = self.provider.responder(
            "¿Dónde están ubicados?",
            [],
            self.procedures,
        )

        self.assertIn("Hernando de Aguirre 128", answer)

    def test_service_returns_suggestions(self):
        response = AsistenteService.responder("Hola", [], self.procedures)
        self.assertEqual(response.provider, "local")
        self.assertGreater(len(response.suggestions), 0)

    def test_extracts_iso_and_relative_dates(self):
        reference = date(2026, 10, 3)

        self.assertEqual(
            AsistenteService.extraer_fecha("Agenda para 2026-10-15", reference),
            date(2026, 10, 15),
        )
        self.assertEqual(
            AsistenteService.extraer_fecha("Quiero una cita pasado mañana", reference),
            date(2026, 10, 5),
        )

    def test_availability_response_includes_booking_action(self):
        response = AsistenteService.responder(
            "Quiero agendar Abdominoplastia para 2026-10-15",
            [],
            self.procedures,
            requested_date=date(2026, 10, 15),
            available_hours=["09:00", "10:00"],
        )

        self.assertIn("09:00", response.answer)
        self.assertEqual(len(response.actions), 1)
        self.assertEqual(response.actions[0].type, "open_booking")
        self.assertEqual(response.actions[0].procedure_names, ["Abdominoplastia"])
        self.assertEqual(response.actions[0].date, "2026-10-15")

    def test_procedure_detection_ignores_shared_suffixes(self):
        procedures = [
            ProcedimientoContexto(
                nombre="Lipoabdominoplastia con Transferencia Glútea",
                descripcion="Procedimiento corporal",
            ),
            ProcedimientoContexto(
                nombre="Lipoescultura 360 con Transferencia Glútea",
                descripcion="Procedimiento corporal",
            ),
        ]

        matches = AsistenteService.detectar_procedimientos(
            "Quiero Lipoabdominoplastia con Transferencia Glútea",
            procedures,
        )

        self.assertEqual(
            matches,
            ["Lipoabdominoplastia con Transferencia Glútea"],
        )


if __name__ == "__main__":
    unittest.main()
