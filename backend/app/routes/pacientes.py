from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.common.security import get_current_administrador
from app.models.administrador import Administrador
from app.routes.deps import get_db
from app.schemas.paciente import PacienteCreate, PacienteOut, PacienteUpdate
from app.services.paciente_service import PacienteService


router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


@router.post(
    "",
    response_model=PacienteOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_paciente(
    payload: PacienteCreate,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    paciente = PacienteService.crear_paciente(db, payload)
    db.commit()
    db.refresh(paciente)
    return paciente


@router.get("/filtrar", response_model=list[PacienteOut])
def filtrar_pacientes(
    buscar: str | None = None,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    return PacienteService.filtrar_pacientes(db, buscar)


@router.get("/{identificacion}", response_model=PacienteOut)
def buscar_paciente(
    identificacion: str,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    return PacienteService.obtener_por_identificacion(db, identificacion)


@router.patch("/{identificacion}", response_model=PacienteOut)
def actualizar_paciente(
    identificacion: str,
    payload: PacienteUpdate,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    paciente = PacienteService.actualizar_datos(
        db,
        identificacion,
        payload,
    )
    db.commit()
    db.refresh(paciente)
    return paciente


@router.get("", response_model=list[PacienteOut])
def listar_pacientes_activos(
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    return PacienteService.listar_pacientes_activos(db)


@router.delete(
    "/{identificacion}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_paciente(
    identificacion: str,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    PacienteService.eliminar_paciente(db, identificacion)
    db.commit()
