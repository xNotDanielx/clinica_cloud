from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.common.security import get_current_administrador
from app.models.administrador import Administrador
from app.routes.deps import get_db
from app.schemas.administrador import (
    AdministradorAuthResponse,
    AdministradorCreate,
    AdministradorLoginRequest,
    AdministradorOut,
)
from app.services.administrador_service import AdministradorService


router = APIRouter(
    prefix="/administradores",
    tags=["Administradores"],
)


@router.post(
    "",
    response_model=AdministradorOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_administrador(
    payload: AdministradorCreate,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    administrador = AdministradorService.crear_administrador(
        db,
        usuario=payload.usuario,
        contrasena=payload.contrasena,
    )
    db.commit()
    db.refresh(administrador)
    return administrador


@router.post("/login", response_model=AdministradorAuthResponse)
def login_administrador(
    payload: AdministradorLoginRequest,
    db: Session = Depends(get_db),
):
    administrador, token = AdministradorService.autenticar(
        db,
        usuario=payload.usuario,
        contrasena=payload.contrasena,
    )
    db.commit()

    return AdministradorAuthResponse(
        access_token=token,
        administrador=AdministradorOut.model_validate(administrador),
    )


@router.get("/me", response_model=AdministradorOut)
def obtener_mi_perfil(
    administrador: Administrador = Depends(get_current_administrador),
):
    return administrador
