from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdministradorBase(BaseModel):
    usuario: str
    activo: bool = True
    ultimo_acceso: datetime | None = None


class AdministradorCreate(BaseModel):
    usuario: str
    contrasena: str


class AdministradorUpdate(BaseModel):
    usuario: str | None = None
    activo: bool | None = None
    ultimo_acceso: datetime | None = None


class AdministradorOut(AdministradorBase):
    id: int
    fecha_ultima_actualizacion: datetime

    model_config = ConfigDict(from_attributes=True)


class AdministradorLoginRequest(BaseModel):
    usuario: str
    contrasena: str


class AdministradorAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    administrador: AdministradorOut