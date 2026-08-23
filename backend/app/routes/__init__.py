from app.routes.citas import router as citas_router
from app.routes.administradores import router as administradores_router
from app.routes.codigos_promocionales import router as codigos_promocionales_router
from app.routes.pacientes import router as pacientes_router
from app.routes.procedimientos import router as procedimientos_router
from app.routes.enums import router as enums_router

__all__ = [
    "pacientes_router",
    "procedimientos_router",
    "citas_router",
    "administradores_router",
    "codigos_promocionales_router",
    "enums_router",
]
