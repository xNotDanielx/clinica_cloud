from datetime import date, datetime, time
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from app.common.enums import EstadoCita


class CitaPublicaRequest(BaseModel):
    nombre_completo: str
    tipo_identificacion: str
    identificacion: str
    telefono: str
    email: str
    direccion: str
    sexo: str
    fecha_programada: date
    hora: str
    procedimiento_ids: List[int]
    nota: Optional[str] = None
    valor_consulta: Decimal


class CitaBase(BaseModel):
    id_paciente: str
    nombre_paciente: str | None = None
    id_codigo_promocional: int | None = None
    fecha_programada: date
    hora_inicio: time
    hora_fin: time
    monto_base: Decimal | None = None
    monto_descuento: Decimal | None = None
    monto_final: Decimal | None = None
    nota: str | None = None
    notas_asesoria: str | None = None
    razon_rechazo: str | None = None
    estado: EstadoCita


class CitaCreate(CitaBase):
    pass


class CitaCreateRequest(BaseModel):
    id_paciente: str
    id_codigo_promocional: int | None = None
    fecha_programada: date
    hora_inicio: time
    hora_fin: time
    nota: str | None = None
    estado: EstadoCita = EstadoCita.PENDIENTE_APROBACION
    procedimiento_ids: list[int]
    valor_consulta: Decimal


class CitaUpdate(BaseModel):
    id_paciente: str | None = None
    id_codigo_promocional: int | None = None
    fecha_programada: date | None = None
    hora_inicio: time | None = None
    hora_fin: time | None = None
    nota: str | None = None
    notas_asesoria: str | None = None
    razon_rechazo: str | None = None
    estado: EstadoCita | None = None
    procedimiento_ids: list[int] | None = None
    valor_consulta: Decimal | None = None


class CitaOut(CitaBase):
    id: int
    fecha_ultima_actualizacion: datetime
    procedimiento_ids: list[int] = []


    model_config = ConfigDict(from_attributes=True)


class CitaCambiarEstadoRequest(BaseModel):
    estado: EstadoCita