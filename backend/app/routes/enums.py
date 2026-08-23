from app.common.enums import Sexo, Genero, TipoDocumento
from app.common.prefixes import PREFIJOS_TELEFONICOS
from fastapi import APIRouter

router = APIRouter(prefix="/catalogos", tags=["Catalogos"])

@router.get("")
def obtener_catalogos():
    return {
        "sexos": [e.value for e in Sexo],
        "generos": [e.value for e in Genero],
        "tipos_documento": [e.value for e in TipoDocumento],
        "prefijos_telefonicos": PREFIJOS_TELEFONICOS,
    }