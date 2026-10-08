from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.common.security import get_current_administrador
from app.routes.deps import get_db
from app.schemas.asistente import ConsultaAsistente, RespuestaAsistente
from app.services.asistente_admin_service import AsistenteAdminService
from app.services.asistente_service import AsistenteService, ProcedimientoContexto
from app.services.cita_service import CitaService
from app.services.procedimiento_service import ProcedimientoService


router = APIRouter(prefix="/asistente", tags=["Asistente"])


@router.post("/admin/chat", response_model=RespuestaAsistente)
def conversar_como_administrador(
    payload: ConsultaAsistente,
    db: Session = Depends(get_db),
    administrador=Depends(get_current_administrador),
):
    del administrador
    return AsistenteAdminService.responder(db, payload.message)


@router.post("/chat", response_model=RespuestaAsistente)
def conversar(payload: ConsultaAsistente, db: Session = Depends(get_db)):
    procedures = [
        ProcedimientoContexto(nombre=item.nombre, descripcion=item.descripcion)
        for item in ProcedimientoService.listar_activos(db)
    ]
    try:
        requested_date = AsistenteService.extraer_fecha(payload.message)
        available_hours = None
        if requested_date and AsistenteService.es_intencion_cita(payload.message):
            available_hours = CitaService.obtener_horarios_disponibles(
                db,
                requested_date,
            )
        return AsistenteService.responder(
            payload.message,
            payload.history,
            procedures,
            requested_date=requested_date,
            available_hours=available_hours,
        )
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail="El asistente no está disponible temporalmente.",
        ) from error
