from datetime import date, datetime, time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.common.enums import EstadoCita, Sexo, TipoDocumento


class CitaPublicaRequest(BaseModel):
    nombre_completo: str = Field(min_length=1, max_length=150)
    tipo_identificacion: TipoDocumento
    identificacion: str = Field(min_length=1, max_length=20)
    telefono: str = Field(min_length=1, max_length=30)
    email: str = Field(min_length=1, max_length=100)
    direccion: str = Field(min_length=1, max_length=150)
    sexo: Sexo
    fecha_programada: date
    hora: str = Field(pattern=r"^\d{2}:\d{2}$")
    procedimiento_ids: list[int] = Field(min_length=1, max_length=2)
    nota: str | None = None

    model_config = ConfigDict(extra="ignore")


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
    procedimiento_ids: list[int] = Field(min_length=1, max_length=2)
    valor_consulta: Decimal = Field(ge=0)


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
    procedimiento_ids: list[int] | None = Field(default=None, min_length=1, max_length=2)
    valor_consulta: Decimal | None = Field(default=None, ge=0)


class CitaOut(CitaBase):
    id: int
    fecha_ultima_actualizacion: datetime
    procedimiento_ids: list[int] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class CitaCambiarEstadoRequest(BaseModel):
    estado: EstadoCita
