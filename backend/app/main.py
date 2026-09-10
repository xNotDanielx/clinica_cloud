import os

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.lifespan import lifespan
from app.common.exceptions import ServiceError
from app.db.database import Base, engine, ensure_schema_compatibility
import app.models
from app.routes import (
    administradores_router,
    citas_router,
    codigos_promocionales_router,
    pacientes_router,
    procedimientos_router,
    enums_router,
)


app = FastAPI(
    title="Clinica Renacer API",
    description="API para la gestión de la clínica Renacer",
    version="1.0.0",
    lifespan=lifespan,
)


@app.exception_handler(ServiceError)
def handle_service_error(_: Request, error: ServiceError):
    from app.common.exceptions import ConflictError, NotFoundError, UnauthorizedError, ValidationError

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

    return JSONResponse(status_code=status_code, content={"detail": str(error)})

# Registra metadatos de todos los modelos y crea tablas si no existen.
Base.metadata.create_all(bind=engine)
ensure_schema_compatibility()

app.include_router(pacientes_router)
app.include_router(procedimientos_router)
app.include_router(citas_router)
app.include_router(codigos_promocionales_router)
app.include_router(administradores_router)
app.include_router(enums_router)

DEFAULT_CORS_ORIGINS = ",".join([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
])

origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
