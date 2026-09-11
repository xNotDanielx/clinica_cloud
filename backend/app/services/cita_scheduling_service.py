from datetime import date, time

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.constants import APPOINTMENT_SLOT_LABELS, APPOINTMENT_SLOTS
from app.common.enums import EstadoCita
from app.common.exceptions import ConflictError, ValidationError
from app.models.cita import Cita


class CitaSchedulingService:
    @staticmethod
    def verificar_disponibilidad(
        session: Session,
        fecha_programada: date,
        hora_inicio: time,
        hora_fin: time,
        cita_id_ignorar: int | None = None,
    ) -> None:
        stmt = select(Cita.id).where(
            Cita.activo.is_(True),
            Cita.fecha_programada == fecha_programada,
            Cita.estado != EstadoCita.CANCELADA.value,
            Cita.hora_inicio < hora_fin,
            Cita.hora_fin > hora_inicio,
        )

        if cita_id_ignorar is not None:
            stmt = stmt.where(Cita.id != cita_id_ignorar)

        if session.scalar(stmt.limit(1)):
            raise ConflictError(
                "Ya existe una cita que se solapa en ese horario"
            )

    @staticmethod
    def validar_slot_publico(
        fecha_programada: date,
        hora: str,
    ) -> tuple[time, time]:
        if fecha_programada < date.today():
            raise ValidationError(
                "No puedes agendar una cita en una fecha pasada"
            )

        if hora not in APPOINTMENT_SLOT_LABELS:
            raise ValidationError("El horario seleccionado no es válido")

        slot = next(
            (
                (inicio, fin)
                for label, inicio, fin in APPOINTMENT_SLOTS
                if label == hora
            ),
            None,
        )
        if slot is None:
            raise ValidationError("El horario seleccionado no es válido")

        return slot

    @staticmethod
    def obtener_horarios_disponibles(
        session: Session,
        fecha_programada: date,
    ) -> list[str]:
        citas = session.execute(
            select(Cita.hora_inicio, Cita.hora_fin).where(
                Cita.activo.is_(True),
                Cita.fecha_programada == fecha_programada,
                Cita.estado != EstadoCita.CANCELADA.value,
            )
        ).all()

        disponibles: list[str] = []
        for label, slot_inicio, slot_fin in APPOINTMENT_SLOTS:
            ocupado = any(
                cita_inicio < slot_fin and cita_fin > slot_inicio
                for cita_inicio, cita_fin in citas
            )
            if not ocupado:
                disponibles.append(label)

        return disponibles
