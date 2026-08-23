from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.paciente import PacienteCreate, PacienteOut, PacienteUpdate
from app.services.paciente_service import PacienteService

from app.routes.deps import get_db
from app.routes.errors import to_http_exception
from app.common.security import get_current_administrador

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


@router.post("", response_model=PacienteOut, status_code=201)
def crear_paciente(payload: PacienteCreate, db: Session = Depends(get_db)):
    try:
        paciente = PacienteService.crear_paciente(db, payload)
        db.commit()
        db.refresh(paciente)
        return paciente
    except Exception as error:
        db.rollback()
        raise to_http_exception(error)

@router.get("/filtrar", response_model=list[PacienteOut])
def filtrar_pacientes(buscar: str | None = None, db: Session = Depends(get_db), administrador=Depends(get_current_administrador)):
    try:
        return PacienteService.filtrar_pacientes(db, buscar)
    except Exception as error:
        raise to_http_exception(error)

@router.get("/{identificacion}", response_model=PacienteOut)
def buscar_paciente(identificacion: str, db: Session = Depends(get_db), administrador=Depends(get_current_administrador)):
    try:
        return PacienteService.buscar_por_identificacion(db, identificacion)
    except Exception as error:
        raise to_http_exception(error)


@router.patch("/{identificacion}", response_model=PacienteOut)
def actualizar_paciente(identificacion: str, payload: PacienteUpdate, db: Session = Depends(get_db), administrador=Depends(get_current_administrador)):
    try:
        paciente = PacienteService.actualizar_datos(db, identificacion, payload)
        db.commit()
        db.refresh(paciente)
        return paciente
    except Exception as error:
        db.rollback()
        raise to_http_exception(error)

@router.get("", response_model=list[PacienteOut])
def listar_pacientes_activos(db: Session = Depends(get_db), administrador=Depends(get_current_administrador)):
    try:
        return PacienteService.listar_pacientes_activos(db)
    except Exception as error:
        raise to_http_exception(error)
    
@router.delete("/{identificacion}", status_code=204)
def eliminar_paciente(identificacion: str, db: Session = Depends(get_db), administrador=Depends(get_current_administrador)):
    try:
        PacienteService.eliminar_paciente(db, identificacion)
        db.commit()
    except Exception as error:
        db.rollback()
        raise to_http_exception(error)