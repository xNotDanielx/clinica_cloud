import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.common.exceptions import (
    ConflictError,
    NotFoundError,
    ServiceError,
    UnauthorizedError,
    ValidationError,
)
from app.core.config import get_settings
from app.core.lifespan import lifespan
from app.db.database import engine
from app.routes import (
    administradores_router,
    citas_router,
    codigos_promocionales_router,
    enums_router,
    pacientes_router,
    procedimientos_router,
)


logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Clinica Renacer API",
        description="API para la gestión de la clínica Renacer",
        version="1.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(pacientes_router)
    app.include_router(procedimientos_router)
    app.include_router(citas_router)
    app.include_router(codigos_promocionales_router)
    app.include_router(administradores_router)
    app.include_router(enums_router)

    @app.exception_handler(ServiceError)
    async def handle_service_error(
        _: Request,
        error: ServiceError,
    ) -> JSONResponse:
        if isinstance(error, NotFoundError):
            status_code = 404
        elif isinstance(error, ConflictError):
            status_code = 409
        elif isinstance(error, UnauthorizedError):
            status_code = 401
        elif isinstance(error, ValidationError):
            status_code = 422
        else:
            status_code = 500

        return JSONResponse(
            status_code=status_code,
            content={"detail": str(error)},
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(
        _: Request,
        error: Exception,
    ) -> JSONResponse:
        logger.exception("Error no controlado en la API", exc_info=error)
        return JSONResponse(
            status_code=500,
            content={"detail": "Error interno del servidor"},
        )

    @app.get("/health", include_in_schema=False)
    def health():
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return {"status": "ok"}
        except Exception:
            return JSONResponse(
                status_code=503,
                content={"status": "unhealthy"},
            )

    @app.get("/")
    def root():
        return {"message": "Backend funcionando"}

    return app


app = create_app()
