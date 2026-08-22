from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.database import SessionLocal
from app.scripts.seed_admin import crear_administrador_por_defecto


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()

    try:
        crear_administrador_por_defecto(db)
    finally:
        db.close()

    yield