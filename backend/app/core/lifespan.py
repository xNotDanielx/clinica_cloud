from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import get_settings
from app.db.database import SessionLocal
from app.scripts.seed_admin import crear_administrador_por_defecto


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()

    if settings.initial_admin_user and settings.initial_admin_password:
        with SessionLocal() as db:
            crear_administrador_por_defecto(
                db,
                usuario=settings.initial_admin_user,
                contrasena=settings.initial_admin_password,
            )

    yield
