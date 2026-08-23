from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PacienteBase(BaseModel):
    identificacion: str
    tipo_identificacion: str
    nombre_completo: str
    telefono: str
    email: str
    direccion: str
    sexo: str
    nacionalidad: str | None = None
    genero: str | None = None
    fecha_nacimiento: datetime | None = None
    altura: float | None = None
    peso: float | None = None
    activo: bool = True


class PacienteCreate(PacienteBase):
    pass


class PacienteUpdate(BaseModel):
    tipo_identificacion: str | None = None
    nombre_completo: str | None = None
    telefono: str | None = None
    email: str | None = None
    direccion: str | None = None
    sexo: str | None = None
    nacionalidad: str | None = None
    genero: str | None = None
    fecha_nacimiento: datetime | None = None
    altura: float | None = None
    peso: float | None = None
    activo: bool | None = None

class PacienteOut(PacienteBase):
    fecha_ultima_actualizacion: datetime

    model_config = ConfigDict(from_attributes=True)
