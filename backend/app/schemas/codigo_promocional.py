from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.common.enums import TipoDescuento


class CodigoPromocionalBase(BaseModel):
    codigo: str
    descripcion: str | None = None
    tipo_descuento: TipoDescuento
    valor_descuento: Decimal
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    usos_maximos: int | None = None
    activo: bool = True


class CodigoPromocionalCreate(CodigoPromocionalBase):
    pass


class CodigoPromocionalUpdate(BaseModel):
    codigo: str | None = None
    descripcion: str | None = None
    tipo_descuento: TipoDescuento | None = None
    valor_descuento: Decimal | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    usos_maximos: int | None = None
    activo: bool | None = None


class CodigoPromocionalOut(CodigoPromocionalBase):
    id: int
    fecha_ultima_actualizacion: datetime

    model_config = ConfigDict(from_attributes=True)
