from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.common.enums import Genero, Sexo, TipoDocumento


class PacienteBase(BaseModel):
    identificacion: str = Field(min_length=1, max_length=20)
    tipo_identificacion: TipoDocumento
    nombre_completo: str = Field(min_length=1, max_length=150)
    telefono: str = Field(min_length=1, max_length=30)
    email: str = Field(min_length=1, max_length=100)
    direccion: str = Field(min_length=1, max_length=150)
    sexo: Sexo
    nacionalidad: str | None = Field(default=None, max_length=150)
    genero: Genero | None = None
    fecha_nacimiento: datetime | None = None
    altura: float | None = Field(default=None, gt=0)
    peso: float | None = Field(default=None, gt=0)
    activo: bool = True


class PacienteCreate(PacienteBase):
    pass


class PacienteUpdate(BaseModel):
    tipo_identificacion: TipoDocumento | None = None
    nombre_completo: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    telefono: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )
    email: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    direccion: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    sexo: Sexo | None = None
    nacionalidad: str | None = Field(default=None, max_length=150)
    genero: Genero | None = None
    fecha_nacimiento: datetime | None = None
    altura: float | None = Field(default=None, gt=0)
    peso: float | None = Field(default=None, gt=0)
    activo: bool | None = None


class PacienteOut(PacienteBase):
    fecha_ultima_actualizacion: datetime

    model_config = ConfigDict(from_attributes=True)
