from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CitaProcedimientoBase(BaseModel):
    id_cita: int
    id_procedimiento: int
    precio_unitario_al_reservar: Decimal | None = None


class CitaProcedimientoCreate(CitaProcedimientoBase):
    pass


class CitaProcedimientoUpdate(BaseModel):
    id_cita: int | None = None
    id_procedimiento: int | None = None
    precio_unitario_al_reservar: Decimal | None = None


class CitaProcedimientoOut(CitaProcedimientoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
