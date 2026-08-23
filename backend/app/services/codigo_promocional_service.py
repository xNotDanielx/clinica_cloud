from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.cita import Cita
from app.models.codigo_promocional import CodigoPromocional
from app.common.enums import TipoDescuento
from app.common.exceptions import NotFoundError, ValidationError


class CodigoPromocionalService:
    @staticmethod
    def obtener_por_codigo(session: Session, codigo: str) -> CodigoPromocional:
        stmt = select(CodigoPromocional).where(CodigoPromocional.codigo == codigo)
        registro = session.scalars(stmt).first()
        if not registro:
            raise NotFoundError("Código promocional no encontrado")
        return registro

    @staticmethod
    def validar_codigo(session: Session, codigo: str, momento: datetime | None = None) -> CodigoPromocional:
        if not codigo:
            raise ValidationError("No se proporcionó un código promocional")
        registro = CodigoPromocionalService.obtener_por_codigo(session, codigo)
        momento = momento or datetime.now()

        if not registro.activo:
            raise ValidationError("El código promocional está inactivo")
        if registro.tipo_descuento != TipoDescuento.PORCENTAJE.value:
            raise ValidationError("El tipo de descuento no es válido")
        if registro.fecha_inicio and momento < registro.fecha_inicio:
            raise ValidationError("El código promocional aún no está vigente")
        if registro.fecha_fin and momento > registro.fecha_fin:
            raise ValidationError("El código promocional ya expiró")
        if registro.usos_maximos is not None:
            usos = session.scalar(
                select(func.count(Cita.id)).where(
                    Cita.id_codigo_promocional == registro.id,
                    Cita.estado != "cancelada",
                )
            )
            if usos is not None and usos >= registro.usos_maximos:
                raise ValidationError("El código promocional alcanzó su cantidad máxima de usos")
        return registro

    @staticmethod
    def calcular_descuento(
        session: Session,
        codigo: str | None,
        valor_consulta: Decimal,
        momento: datetime | None = None,
    ) -> Decimal:

        # Si no hay código promocional, no aplica descuento
        if not codigo:
            return Decimal("0.00")

        registro = CodigoPromocionalService.validar_codigo(
            session,
            codigo,
            momento=momento,
        )

        descuento = (
            Decimal(valor_consulta)
            * Decimal(registro.valor_descuento)
            / Decimal("100")
        )

        return descuento.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )
