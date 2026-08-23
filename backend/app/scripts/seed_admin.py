import os

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.administrador import Administrador
from app.common.security import hash_password


DEFAULT_ADMIN_USUARIO = os.getenv("DEFAULT_ADMIN_USUARIO", "admin")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin")


def crear_administrador_por_defecto(db: Session) -> None:
    administrador = db.scalar(
        select(Administrador).where(
            Administrador.usuario == DEFAULT_ADMIN_USUARIO
        )
    )

    if administrador:
        return

    nuevo_administrador = Administrador(
        usuario=DEFAULT_ADMIN_USUARIO,
        contrasena_hash=hash_password(DEFAULT_ADMIN_PASSWORD),
        activo=True,
    )

    db.add(nuevo_administrador)
    db.commit()

    print(
        f"Administrador por defecto creado: "
        f"{DEFAULT_ADMIN_USUARIO}"
    )