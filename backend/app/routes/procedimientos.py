from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.routes.deps import get_db
from app.routes.errors import to_http_exception
from app.schemas.procedimiento import ProcedimientoOut
from app.services.procedimiento_service import ProcedimientoService

router = APIRouter(prefix="/procedimientos", tags=["Procedimientos"])


@router.get("/activos", response_model=list[ProcedimientoOut])
def listar_procedimientos_activos(db: Session = Depends(get_db)):
    try:
        return ProcedimientoService.listar_activos(db)
    except Exception as error:
        raise to_http_exception(error)
