from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.common.enums import EstadoCita
from app.models.cita import Cita
from app.schemas.asistente import RespuestaAsistente
from app.services.asistente_service import AsistenteService


PRIVATE_TERMS = (
    "correo",
    "documento",
    "identificacion",
    "nota clinica",
    "telefono",
)


class AsistenteAdminService:
    @staticmethod
    def sugerencias() -> list[str]:
        return [
            "Resumen de citas por estado",
            "¿Cuántas citas están pendientes?",
            "Muéstrame la agenda de hoy",
        ]

    @staticmethod
    def responder(
        session: Session,
        message: str,
        today: date | None = None,
    ) -> RespuestaAsistente:
        reference = today or date.today()
        normalized = AsistenteService.normalizar(message)

        if any(term in normalized for term in PRIVATE_TERMS):
            answer = (
                "No muestro datos personales ni notas clínicas dentro del chat. "
                "Consulta el registro desde la sección Pacientes o Citas del panel."
            )
        elif "pendiente" in normalized or "autorizar" in normalized:
            answer = AsistenteAdminService._resumen_pendientes(
                session,
                normalized,
                reference,
            )
        elif any(term in normalized for term in ("resumen", "estado", "dashboard")):
            answer = AsistenteAdminService._resumen_estados(session)
        elif any(term in normalized for term in ("agenda", "cita", "horario")):
            requested_date = AsistenteService.extraer_fecha(message, reference) or reference
            answer = AsistenteAdminService._agenda(session, requested_date)
        else:
            answer = (
                "Puedo resumir citas por estado, contar solicitudes pendientes y "
                "consultar la agenda de una fecha. Las operaciones que modifican "
                "datos se realizan desde los controles del panel."
            )

        return RespuestaAsistente(
            answer=answer,
            provider="admin-local",
            suggestions=AsistenteAdminService.sugerencias(),
        )

    @staticmethod
    def _resumen_pendientes(
        session: Session,
        normalized_message: str,
        reference: date,
    ) -> str:
        filters = [
            Cita.activo.is_(True),
            Cita.estado == EstadoCita.PENDIENTE_APROBACION.value,
        ]
        period = ""
        if "semana" in normalized_message:
            filters.extend(
                [
                    Cita.fecha_programada >= reference,
                    Cita.fecha_programada <= reference + timedelta(days=6),
                ]
            )
            period = " para los próximos siete días"

        total = session.scalar(select(func.count(Cita.id)).where(*filters)) or 0
        if total == 0:
            return f"No hay citas pendientes de aprobación{period}."

        appointments = list(
            session.scalars(
                select(Cita)
                .where(*filters)
                .order_by(Cita.fecha_programada, Cita.hora_inicio)
                .limit(5)
            ).all()
        )
        details = ", ".join(
            f"#{item.id} el {item.fecha_programada.strftime('%d/%m')} a las "
            f"{item.hora_inicio.strftime('%H:%M')}"
            for item in appointments
        )
        suffix = f" Próximas: {details}." if details else ""
        return f"Hay {total} citas pendientes de aprobación{period}.{suffix}"

    @staticmethod
    def _agenda(session: Session, requested_date: date) -> str:
        appointments = list(
            session.scalars(
                select(Cita)
                .where(
                    Cita.activo.is_(True),
                    Cita.fecha_programada == requested_date,
                    Cita.estado != EstadoCita.CANCELADA.value,
                )
                .order_by(Cita.hora_inicio)
            ).all()
        )
        formatted_date = requested_date.strftime("%d/%m/%Y")
        if not appointments:
            return f"No hay citas activas en la agenda del {formatted_date}."

        details = ", ".join(
            f"#{item.id} a las {item.hora_inicio.strftime('%H:%M')} ({item.estado})"
            for item in appointments
        )
        return (
            f"La agenda del {formatted_date} tiene {len(appointments)} citas: "
            f"{details}. Abre la sección Citas para consultar sus datos."
        )

    @staticmethod
    def _resumen_estados(session: Session) -> str:
        rows = session.execute(
            select(Cita.estado, func.count(Cita.id))
            .where(Cita.activo.is_(True))
            .group_by(Cita.estado)
            .order_by(Cita.estado)
        ).all()
        if not rows:
            return "No hay citas activas registradas."

        labels = {
            EstadoCita.PENDIENTE_APROBACION.value: "pendientes",
            EstadoCita.APROBADA.value: "aprobadas",
            EstadoCita.CANCELADA.value: "canceladas",
            EstadoCita.COMPLETADA.value: "completadas",
        }
        summary = ", ".join(
            f"{labels.get(status, status)}: {count}" for status, count in rows
        )
        return f"Resumen de citas activas por estado: {summary}."
