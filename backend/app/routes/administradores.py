from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.common.security import get_current_administrador
from app.routes.deps import get_db
from app.routes.errors import to_http_exception
from app.schemas.administrador import (
    AdministradorAuthResponse,
    AdministradorCreate,
    AdministradorLoginRequest,
    AdministradorOut,
)
from app.services.administrador_service import AdministradorService

router = APIRouter(prefix="/administradores", tags=["Administradores"])


@router.post("", response_model=AdministradorOut, status_code=201)
def crear_administrador(payload: AdministradorCreate, db: Session = Depends(get_db), administrador=Depends(get_current_administrador)):
    try:
        administrador = AdministradorService.crear_administrador(
            db,
            usuario=payload.usuario,
            contrasena=payload.contrasena,
        )
        return administrador
    except Exception as error:
        db.rollback()
        raise to_http_exception(error)


@router.post("/login", response_model=AdministradorAuthResponse)
def login_administrador(payload: AdministradorLoginRequest, db: Session = Depends(get_db)):
    try:
        administrador, token = AdministradorService.autenticar(
            db,
            usuario=payload.usuario,
            contrasena=payload.contrasena,
        )
        return AdministradorAuthResponse(
            access_token=token,
            administrador=AdministradorOut.model_validate(administrador),
        )
    except Exception as error:
        db.rollback()
        raise to_http_exception(error)


@router.get("/me", response_model=AdministradorOut)
def obtener_mi_perfil(administrador=Depends(get_current_administrador)):
    return administrador