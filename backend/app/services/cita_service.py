from __future__ import annotations

from datetime import date, time, timedelta, datetime
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import select, or_, cast, String
from sqlalchemy.orm import Session, selectinload

from app.common.enums import EstadoCita
from app.models.cita import Cita
from app.models.cita_procedimiento import CitaProcedimiento
from app.models.codigo_promocional import CodigoPromocional
from app.models.paciente import Paciente
from app.models.procedimiento import Procedimiento
from app.services.codigo_promocional_service import CodigoPromocionalService
from app.common.exceptions import ConflictError, NotFoundError, ValidationError
from app.schemas.paciente import PacienteCreate
from app.services.paciente_service import PacienteService
from app.schemas.cita import CitaUpdate


class CitaService:
    @staticmethod
    def verificar_disponibilidad_horario(
        session: Session,
        fecha_programada: date,
        hora_inicio: time,
        hora_fin: time,
        cita_id_ignorar: int | None = None,
    ) -> None:
        stmt = select(Cita.id).where(
            Cita.fecha_programada == fecha_programada,
            Cita.estado != EstadoCita.CANCELADA.value,
            Cita.hora_inicio < hora_fin,
            Cita.hora_fin > hora_inicio,
        )
        if cita_id_ignorar is not None:
            stmt = stmt.where(Cita.id != cita_id_ignorar)

        conflicto = session.scalar(stmt.limit(1))
        if conflicto:
            raise ConflictError("Ya existe una cita que se solapa en ese horario")

    @staticmethod
    def _obtener_procedimientos(session: Session, procedimiento_ids: list[int]) -> list[Procedimiento]:
        if not procedimiento_ids:
            raise ValidationError("Debes seleccionar al menos un procedimiento")

        stmt = select(Procedimiento).where(
            Procedimiento.id.in_(procedimiento_ids),
            Procedimiento.activo.is_(True),
        )
        procedimientos = list(session.scalars(stmt).all())
        encontrados = {procedimiento.id for procedimiento in procedimientos}
        faltantes = [procedimiento_id for procedimiento_id in procedimiento_ids if procedimiento_id not in encontrados]
        if faltantes:
            raise NotFoundError(f"Procedimientos no encontrados o inactivos: {faltantes}")
        return procedimientos

    @staticmethod
    def _calcular_monto_base(procedimientos: list[Procedimiento]) -> Decimal:
        total = sum((Decimal(procedimiento.precio) for procedimiento in procedimientos), Decimal("0"))
        return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @staticmethod
    def crear_cita(
        session: Session,
        *,
        id_paciente: str,
        fecha_programada: date,
        hora_inicio: time,
        hora_fin: time,
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

        CitaService.verificar_disponibilidad_horario(session, fecha_programada, hora_inicio, hora_fin)

        procedimientos = CitaService._obtener_procedimientos(session, procedimiento_ids)
        monto_base = CitaService._calcular_monto_base(procedimientos)

        monto_descuento = Decimal("0.00")
        if id_codigo_promocional is not None:
            codigo = session.get(CodigoPromocional, id_codigo_promocional)
            if not codigo:
                raise NotFoundError("Código promocional no encontrado")
            codigo = CodigoPromocionalService.validar_codigo(session, codigo.codigo)
            monto_descuento = CodigoPromocionalService.calcular_descuento(
                session,
                codigo.codigo,
                Decimal(valor_consulta),
            )

        monto_final = (monto_base + Decimal(valor_consulta) - monto_descuento).quantize(
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
        db: Session,
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
        valor_consulta: Decimal = Decimal("0.00"),
    ):
        try:
            paciente_data = PacienteCreate(
                identificacion=identificacion,
                tipo_identificacion=tipo_identificacion,
                nombre_completo=nombre_completo,
                telefono=telefono,
                email=email,
                direccion=direccion,
                sexo=sexo,
            )

            paciente = PacienteService.crear_o_obtener_paciente(db, paciente_data)

            hora_inicio = time.fromisoformat(hora)
            hora_fin = (datetime.combine(date.today(), hora_inicio) + timedelta(hours=1)).time()

            cita = CitaService.crear_cita(
                db,
                id_paciente=paciente.identificacion,
                fecha_programada=fecha_programada,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
                procedimiento_ids=procedimiento_ids,
                valor_consulta=valor_consulta,
                nota=nota,
            )

            db.commit()
            db.refresh(cita)
            return cita

        except Exception:
            db.rollback()
            raise

    @staticmethod
    def actualizar_cita(session: Session, cita_id: int, data: CitaUpdate) -> Cita:
        cita = (
            session.query(Cita)
            .options(selectinload(Cita.citas_procedimientos))
            .filter(Cita.id == cita_id)
            .first()
        )
        if not cita:
            raise NotFoundError("Cita no encontrada")

        cambios = data.model_dump(exclude_unset=True)

        id_paciente = cambios.get("id_paciente", cita.id_paciente)
        fecha_programada = cambios.get("fecha_programada", cita.fecha_programada)
        hora_inicio = cambios.get("hora_inicio", cita.hora_inicio)
        hora_fin = cambios.get("hora_fin", cita.hora_fin)
        id_codigo_promocional = cambios.get("id_codigo_promocional", cita.id_codigo_promocional)

        paciente = session.get(Paciente, id_paciente)
        if not paciente:
            raise NotFoundError("Paciente no encontrado")

        if hora_fin <= hora_inicio:
            raise ValidationError("hora_fin debe ser mayor que hora_inicio")

        CitaService.verificar_disponibilidad_horario(
            session,
            fecha_programada,
            hora_inicio,
            hora_fin,
            cita_id_ignorar=cita.id,
        )

        procedimiento_ids = cambios.get("procedimiento_ids", None)
        valor_consulta = cambios.get("valor_consulta", None)

        if procedimiento_ids is not None:
            procedimientos = CitaService._obtener_procedimientos(session, procedimiento_ids)

            session.query(CitaProcedimiento).filter(
                CitaProcedimiento.id_cita == cita.id
            ).delete()

            for procedimiento in procedimientos:
                session.add(
                    CitaProcedimiento(
                        id_cita=cita.id,
                        id_procedimiento=procedimiento.id,
                        precio_unitario_al_reservar=procedimiento.precio,
                    )
                )

            monto_base = CitaService._calcular_monto_base(procedimientos)
            cita.monto_base = monto_base
        else:
            monto_base = Decimal(cita.monto_base or 0)

        valor_consulta_actual = Decimal(valor_consulta) if valor_consulta is not None else Decimal("0.00")

        monto_descuento = Decimal("0.00")
        if id_codigo_promocional is not None:
            codigo = session.get(CodigoPromocional, id_codigo_promocional)
            if not codigo:
                raise NotFoundError("Código promocional no encontrado")
            codigo = CodigoPromocionalService.validar_codigo(session, codigo.codigo)
            monto_descuento = CodigoPromocionalService.calcular_descuento(
                session,
                codigo.codigo,
                valor_consulta_actual,
            )

        cita.monto_descuento = monto_descuento
        cita.monto_final = (monto_base + valor_consulta_actual - monto_descuento).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        for campo, valor in cambios.items():
            if campo in {"procedimiento_ids", "valor_consulta"}:
                continue
            if campo == "estado" and valor is not None:
                setattr(cita, campo, valor.value if hasattr(valor, "value") else valor)
            else:
                setattr(cita, campo, valor)

        session.flush()
        session.refresh(cita)
        return cita

    @staticmethod
    def listar_citas_por_fecha(session: Session, fecha_programada: date) -> list[Cita]:
        stmt = (
            select(Cita)
            .where(Cita.fecha_programada == fecha_programada)
            .options(
                selectinload(Cita.citas_procedimientos),
                selectinload(Cita.paciente),
                selectinload(Cita.codigo_promocional),
            )
            .order_by(Cita.hora_inicio)
        )
        citas = list(session.scalars(stmt).all())
        if not citas:
            raise NotFoundError("No hay citas registradas para esa fecha")
        return citas

    @staticmethod
    def cambiar_estado_cita(session: Session, cita_id: int, nuevo_estado: EstadoCita) -> Cita:
        cita = session.get(Cita, cita_id)
        if not cita:
            raise NotFoundError("Cita no encontrada")

        cita.estado = nuevo_estado.value
        session.flush()
        return cita
    
    @staticmethod
    def listar_citas(session: Session):
        return session.query(Cita).filter(
            Cita.activo.is_(True),
            Cita.estado != EstadoCita.PENDIENTE_APROBACION.value
            ).all()
    
    @staticmethod
    def listar_citas_pendientes_aprobacion(session: Session):
        return session.query(Cita).filter(
            Cita.activo.is_(True),
            Cita.estado == EstadoCita.PENDIENTE_APROBACION.value
            ).all()
    
    @staticmethod
    def autorizar_cita(session: Session, cita_id: int) -> Cita:
        return CitaService.cambiar_estado_cita(
            session, 
            cita_id, 
            EstadoCita.APROBADA
            )
    
    @staticmethod
    def rechazar_cita(session: Session, cita_id: int) -> Cita:
        return CitaService.cambiar_estado_cita(
            session, 
            cita_id, 
            EstadoCita.CANCELADA
            )


    @staticmethod
    def filtrar_citas(session: Session, buscar: str | None = None):
        query = (
            session.query(Cita)
            .join(Paciente)
            .filter(
                Cita.activo.is_(True),
                Cita.estado != EstadoCita.PENDIENTE_APROBACION.value
            )
        )

        if buscar:
            query = query.filter(
                or_(
                    cast(Cita.id, String).ilike(f"%{buscar}%"),
                    Cita.id_paciente.ilike(f"%{buscar}%"),
                    Cita.estado.ilike(f"%{buscar}%"),
                    cast(Cita.fecha_programada, String).ilike(f"%{buscar}%"),
                    Paciente.nombre_completo.ilike(f"%{buscar}%"),
                )
            )

        return query.all()
    
    @staticmethod
    def eliminar_cita(session: Session, cita_id: int):
        cita = session.get(Cita, cita_id)
        if not cita:
            raise NotFoundError("Cita no encontrada")
        
        cita.activo = False
        session.flush()

    @staticmethod
    def obtener_horarios_disponibles(session: Session, fecha_programada: date) -> list[str]:
        horarios_base = [
            ("09:00", time(9, 0), time(10, 0)),
            ("10:00", time(10, 0), time(11, 0)),
            ("11:00", time(11, 0), time(12, 0)),
            ("12:00", time(12, 0), time(13, 0)),
            ("13:00", time(13, 0), time(14, 0)),
            ("14:00", time(14, 0), time(15, 0)),
            ("15:00", time(15, 0), time(16, 0)),
            ("16:00", time(16, 0), time(17, 0)),
            ("17:00", time(17, 0), time(18, 0)),
            ("18:00", time(18, 0), time(19, 0)),
        ]

        citas = session.execute(
            select(Cita.hora_inicio, Cita.hora_fin).where(
                Cita.fecha_programada == fecha_programada,
                Cita.estado != EstadoCita.CANCELADA.value,
            )
        ).all()

        disponibles: list[str] = []

        for label, slot_inicio, slot_fin in horarios_base:
            ocupado = any(
                cita_inicio < slot_fin and cita_fin > slot_inicio
                for cita_inicio, cita_fin in citas
            )
            if not ocupado:
                disponibles.append(label)

        return disponibles