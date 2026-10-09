from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.routes.deps import get_db
from app.schemas.procedimiento import ProcedimientoOut
from app.services.procedimiento_service import ProcedimientoService


router = APIRouter(
    prefix="/procedimientos",
    tags=["Procedimientos"],
)


@router.get("/activos", response_model=list[ProcedimientoOut])
def listar_procedimientos_activos(
    db: Session = Depends(get_db),
):
    return ProcedimientoService.listar_activos(db)
