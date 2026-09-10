import os

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.administrador import Administrador
from app.common.security import hash_password


INITIAL_ADMIN_USER = os.getenv("INITIAL_ADMIN_USER")
INITIAL_ADMIN_PASSWORD = os.getenv("INITIAL_ADMIN_PASSWORD")


def crear_administrador_por_defecto(db: Session) -> None:
    if not INITIAL_ADMIN_USER and not INITIAL_ADMIN_PASSWORD:
        return

    if not INITIAL_ADMIN_USER or not INITIAL_ADMIN_PASSWORD:
        raise RuntimeError("INITIAL_ADMIN_USER e INITIAL_ADMIN_PASSWORD deben configurarse juntos")

    if len(INITIAL_ADMIN_PASSWORD) < 12:
        raise RuntimeError("INITIAL_ADMIN_PASSWORD debe tener al menos 12 caracteres")

    administrador = db.scalar(
        select(Administrador).where(
            Administrador.usuario == INITIAL_ADMIN_USER
        )
    )

    if administrador:
        return

    nuevo_administrador = Administrador(
        usuario=INITIAL_ADMIN_USER,
        contrasena_hash=hash_password(INITIAL_ADMIN_PASSWORD),
        activo=True,
    )

    db.add(nuevo_administrador)
    db.commit()

    print(
        f"Administrador inicial creado: "
        f"{INITIAL_ADMIN_USER}"
    )
