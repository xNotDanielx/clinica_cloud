from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.constants import MAX_PROCEDURES_PER_APPOINTMENT
from app.common.exceptions import NotFoundError, ValidationError
from app.models.cita import Cita
from app.models.codigo_promocional import CodigoPromocional
from app.models.procedimiento import Procedimiento
from app.services.codigo_promocional_service import CodigoPromocionalService


class CitaPricingService:
    @staticmethod
    def obtener_procedimientos(
        session: Session,
        procedimiento_ids: list[int],
    ) -> list[Procedimiento]:
        if not procedimiento_ids:
            raise ValidationError(
                "Debes seleccionar al menos un procedimiento"
            )
        if len(procedimiento_ids) > MAX_PROCEDURES_PER_APPOINTMENT:
            raise ValidationError(
                "Solo puedes seleccionar hasta "
                f"{MAX_PROCEDURES_PER_APPOINTMENT} procedimientos"
            )
        if len(set(procedimiento_ids)) != len(procedimiento_ids):
            raise ValidationError(
                "No puedes repetir procedimientos en una misma cita"
            )

        stmt = select(Procedimiento).where(
            Procedimiento.id.in_(procedimiento_ids),
            Procedimiento.activo.is_(True),
        )
        procedimientos = list(session.scalars(stmt).all())
        encontrados = {
            procedimiento.id
            for procedimiento in procedimientos
        }
        faltantes = [
            procedimiento_id
            for procedimiento_id in procedimiento_ids
            if procedimiento_id not in encontrados
        ]

        if faltantes:
            raise NotFoundError(
                "Procedimientos no encontrados o inactivos: "
                f"{faltantes}"
            )

        return procedimientos

    @staticmethod
    def calcular_monto_base(
        procedimientos: list[Procedimiento],
    ) -> Decimal:
        total = sum(
            (
                Decimal(procedimiento.precio)
                for procedimiento in procedimientos
            ),
            Decimal("0"),
        )
        return total.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    @staticmethod
    def calcular_valor_consulta_existente(cita: Cita) -> Decimal:
        monto_base = Decimal(cita.monto_base or 0)
        monto_descuento = Decimal(cita.monto_descuento or 0)
        monto_final = Decimal(cita.monto_final or 0)
        return max(
            Decimal("0.00"),
            monto_final + monto_descuento - monto_base,
        )

    @staticmethod
    def calcular_descuento(
        session: Session,
        id_codigo_promocional: int | None,
        valor_consulta: Decimal,
    ) -> Decimal:
        if id_codigo_promocional is None:
            return Decimal("0.00")

        codigo = session.get(
            CodigoPromocional,
            id_codigo_promocional,
        )
        if not codigo:
            raise NotFoundError(
                "Código promocional no encontrado"
            )

        codigo = CodigoPromocionalService.validar_codigo(
            session,
            codigo.codigo,
        )
        return CodigoPromocionalService.calcular_descuento(
            session,
            codigo.codigo,
            valor_consulta,
        )
