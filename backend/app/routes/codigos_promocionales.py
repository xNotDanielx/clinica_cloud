from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.routes.deps import get_db
from app.routes.errors import to_http_exception
from app.schemas.codigo_promocional import CodigoPromocionalOut
from app.services.codigo_promocional_service import CodigoPromocionalService

router = APIRouter(prefix="/codigos-promocionales", tags=["Codigos Promocionales"])


@router.get("/validar", response_model=CodigoPromocionalOut)
def validar_codigo(codigo: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    try:
        return CodigoPromocionalService.validar_codigo(db, codigo)
    except Exception as error:
        raise to_http_exception(error)


@router.get("/calcular-descuento")
def calcular_descuento(
    codigo: str = Query(..., min_length=1),
    valor_consulta: Decimal = Query(..., ge=0),
    db: Session = Depends(get_db),
):
    try:
        descuento = CodigoPromocionalService.calcular_descuento(db, codigo, valor_consulta)
        return {"codigo": codigo, "valor_consulta": valor_consulta, "monto_descuento": descuento}
    except Exception as error:
        raise to_http_exception(error)
