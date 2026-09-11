from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AdministradorBase(BaseModel):
    usuario: str
    activo: bool = True
    ultimo_acceso: datetime | None = None


class AdministradorCreate(BaseModel):
    usuario: str = Field(min_length=3, max_length=50)
    contrasena: str = Field(min_length=12, max_length=128)


class AdministradorUpdate(BaseModel):
    usuario: str | None = Field(default=None, min_length=3, max_length=50)
    activo: bool | None = None
    ultimo_acceso: datetime | None = None


class AdministradorOut(AdministradorBase):
    id: int
    fecha_ultima_actualizacion: datetime

    model_config = ConfigDict(from_attributes=True)


class AdministradorLoginRequest(BaseModel):
    usuario: str = Field(min_length=1, max_length=50)
    contrasena: str = Field(min_length=1, max_length=128)


class AdministradorAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    administrador: AdministradorOut
