from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import String, cast, or_, select
from sqlalchemy.orm import Session, selectinload

from app.common.constants import PUBLIC_CONSULTATION_FEE
from app.common.enums import EstadoCita
from app.common.exceptions import NotFoundError, ValidationError
from app.models.cita import Cita
from app.models.cita_procedimiento import CitaProcedimiento
from app.models.paciente import Paciente
from app.schemas.cita import CitaUpdate
from app.schemas.paciente import PacienteCreate
from app.services.cita_pricing_service import CitaPricingService
from app.services.cita_scheduling_service import CitaSchedulingService
from app.services.paciente_service import PacienteService


class CitaService:
    @staticmethod
    def crear_cita(
        session: Session,
        *,
        id_paciente: str,
        fecha_programada: date,
        hora_inicio,
        hora_fin,
        procedimiento_ids: list[int],
        valor_consulta: Decimal,
        id_codigo_promocional: int | None = None,
        nota: str | None = None,
        estado: EstadoCita = EstadoCita.PENDIENTE_APROBACION,
    ) -> Cita:
        paciente = session.get(Paciente, id_paciente)
        if not paciente:
            raise NotFoundError("Paciente no encontrado")

        if hora_fin <= hora_inicio:
            raise ValidationError("hora_fin debe ser mayor que hora_inicio")

        CitaSchedulingService.verificar_disponibilidad(
            session,
            fecha_programada,
            hora_inicio,
            hora_fin,
        )

        procedimientos = CitaPricingService.obtener_procedimientos(
            session,
            procedimiento_ids,
        )
        monto_base = CitaPricingService.calcular_monto_base(
            procedimientos
        )
        valor_consulta = Decimal(valor_consulta)
        monto_descuento = CitaPricingService.calcular_descuento(
            session,
            id_codigo_promocional,
            valor_consulta,
        )

        monto_final = (
            monto_base + valor_consulta - monto_descuento
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        cita = Cita(
            id_paciente=id_paciente,
            id_codigo_promocional=id_codigo_promocional,
            fecha_programada=fecha_programada,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            monto_base=monto_base,
            monto_descuento=monto_descuento,
            monto_final=monto_final,
            nota=nota,
            estado=estado.value,
        )
        session.add(cita)
        session.flush()

        for procedimiento in procedimientos:
            session.add(
                CitaProcedimiento(
                    id_cita=cita.id,
                    id_procedimiento=procedimiento.id,
                    precio_unitario_al_reservar=procedimiento.precio,
                )
            )

        session.flush()
        session.refresh(cita)
        return cita

    @staticmethod
    def crear_cita_publica(
        session: Session,
        *,
        nombre_completo: str,
        tipo_identificacion: str,
        identificacion: str,
        telefono: str,
        email: str,
        direccion: str,
        sexo: str,
        fecha_programada: date,
        hora: str,
        procedimiento_ids: list[int],
        nota: str | None = None,
    ) -> Cita:
        hora_inicio, hora_fin = (
            CitaSchedulingService.validar_slot_publico(
                fecha_programada,
                hora,
            )
        )

        paciente = PacienteService.crear_o_obtener_paciente(
            session,
            PacienteCreate(
                identificacion=identificacion,
                tipo_identificacion=tipo_identificacion,
                nombre_completo=nombre_completo,
                telefono=telefono,
                email=email,
                direccion=direccion,
                sexo=sexo,
            ),
        )

        return CitaService.crear_cita(
            session,
            id_paciente=paciente.identificacion,
            fecha_programada=fecha_programada,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            procedimiento_ids=procedimiento_ids,
            valor_consulta=PUBLIC_CONSULTATION_FEE,
            nota=nota,
        )

    @staticmethod
    def actualizar_cita(
        session: Session,
        cita_id: int,
        data: CitaUpdate,
    ) -> Cita:
        cita = (
            session.query(Cita)
            .options(selectinload(Cita.citas_procedimientos))
            .filter(Cita.id == cita_id)
            .first()
        )
        if not cita:
            raise NotFoundError("Cita no encontrada")

        cambios = data.model_dump(exclude_unset=True)

        id_paciente = cambios.get(
            "id_paciente",
            cita.id_paciente,
        )
        fecha_programada = cambios.get(
            "fecha_programada",
            cita.fecha_programada,
        )
        hora_inicio = cambios.get(
            "hora_inicio",
            cita.hora_inicio,
        )
        hora_fin = cambios.get(
            "hora_fin",
            cita.hora_fin,
        )
        id_codigo_promocional = cambios.get(
            "id_codigo_promocional",
            cita.id_codigo_promocional,
        )

        if not session.get(Paciente, id_paciente):
            raise NotFoundError("Paciente no encontrado")
        if hora_fin <= hora_inicio:
            raise ValidationError(
                "hora_fin debe ser mayor que hora_inicio"
            )

        CitaSchedulingService.verificar_disponibilidad(
            session,
            fecha_programada,
            hora_inicio,
            hora_fin,
            cita_id_ignorar=cita.id,
        )

        valor_consulta_existente = (
            CitaPricingService.calcular_valor_consulta_existente(cita)
        )

        procedimiento_ids = cambios.get("procedimiento_ids")
        if procedimiento_ids is not None:
            procedimientos = (
                CitaPricingService.obtener_procedimientos(
                    session,
                    procedimiento_ids,
                )
            )

            cita.citas_procedimientos.clear()
            session.flush()

            for procedimiento in procedimientos:
                cita.citas_procedimientos.append(
                    CitaProcedimiento(
                        id_procedimiento=procedimiento.id,
                        precio_unitario_al_reservar=procedimiento.precio,
                    )
                )

            monto_base = CitaPricingService.calcular_monto_base(
                procedimientos
            )
            cita.monto_base = monto_base
        else:
            monto_base = Decimal(cita.monto_base or 0)

        valor_consulta = cambios.get("valor_consulta")
        valor_consulta_actual = (
            Decimal(valor_consulta)
            if valor_consulta is not None
            else valor_consulta_existente
        )

        monto_descuento = CitaPricingService.calcular_descuento(
            session,
            id_codigo_promocional,
            valor_consulta_actual,
        )

        cita.monto_descuento = monto_descuento
        cita.monto_final = (
            monto_base + valor_consulta_actual - monto_descuento
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        for campo, valor in cambios.items():
            if campo in {
                "procedimiento_ids",
                "valor_consulta",
            }:
                continue
            if campo == "estado" and valor is not None:
                setattr(
                    cita,
                    campo,
                    valor.value
                    if hasattr(valor, "value")
                    else valor,
                )
            else:
                setattr(cita, campo, valor)

        session.flush()
        session.refresh(cita)
        return cita

    @staticmethod
    def cambiar_estado_cita(
        session: Session,
        cita_id: int,
        nuevo_estado: EstadoCita,
    ) -> Cita:
        cita = session.get(Cita, cita_id)
        if not cita:
            raise NotFoundError("Cita no encontrada")

        cita.estado = nuevo_estado.value
        session.flush()
        return cita

    @staticmethod
    def listar_citas(session: Session) -> list[Cita]:
        stmt = (
            select(Cita)
            .where(
                Cita.activo.is_(True),
                Cita.estado
                != EstadoCita.PENDIENTE_APROBACION.value,
            )
            .options(
                selectinload(Cita.paciente),
                selectinload(Cita.citas_procedimientos),
            )
            .order_by(
                Cita.fecha_programada,
                Cita.hora_inicio,
            )
        )
        return list(session.scalars(stmt).all())

    @staticmethod
    def listar_citas_pendientes_aprobacion(
        session: Session,
    ) -> list[Cita]:
        stmt = (
            select(Cita)
            .where(
                Cita.activo.is_(True),
                Cita.estado
                == EstadoCita.PENDIENTE_APROBACION.value,
            )
            .options(
                selectinload(Cita.paciente),
                selectinload(Cita.citas_procedimientos),
            )
            .order_by(
                Cita.fecha_programada,
                Cita.hora_inicio,
            )
        )
        return list(session.scalars(stmt).all())

    @staticmethod
    def autorizar_cita(
        session: Session,
        cita_id: int,
    ) -> Cita:
        return CitaService.cambiar_estado_cita(
            session,
            cita_id,
            EstadoCita.APROBADA,
        )

    @staticmethod
    def rechazar_cita(
        session: Session,
        cita_id: int,
    ) -> Cita:
        return CitaService.cambiar_estado_cita(
            session,
            cita_id,
            EstadoCita.CANCELADA,
        )

    @staticmethod
    def filtrar_citas(
        session: Session,
        buscar: str | None = None,
    ) -> list[Cita]:
        query = (
            session.query(Cita)
            .join(Paciente)
            .options(
                selectinload(Cita.paciente),
                selectinload(Cita.citas_procedimientos),
            )
            .filter(
                Cita.activo.is_(True),
                Cita.estado
                != EstadoCita.PENDIENTE_APROBACION.value,
            )
        )

        if buscar:
            termino = f"%{buscar.strip()}%"
            query = query.filter(
                or_(
                    cast(Cita.id, String).ilike(termino),
                    Cita.id_paciente.ilike(termino),
                    Cita.estado.ilike(termino),
                    cast(
                        Cita.fecha_programada,
                        String,
                    ).ilike(termino),
                    Paciente.nombre_completo.ilike(termino),
                )
            )

        return query.order_by(
            Cita.fecha_programada,
            Cita.hora_inicio,
        ).all()

    @staticmethod
    def eliminar_cita(
        session: Session,
        cita_id: int,
    ) -> None:
        cita = session.get(Cita, cita_id)
        if not cita:
            raise NotFoundError("Cita no encontrada")

        cita.activo = False
        session.flush()

    @staticmethod
    def obtener_horarios_disponibles(
        session: Session,
        fecha_programada: date,
    ) -> list[str]:
        return (
            CitaSchedulingService.obtener_horarios_disponibles(
                session,
                fecha_programada,
            )
        )
