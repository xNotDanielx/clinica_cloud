import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.security import hash_password
from app.models.administrador import Administrador


logger = logging.getLogger(__name__)


def crear_administrador_por_defecto(
    db: Session,
    *,
    usuario: str,
    contrasena: str,
) -> None:
    administrador = db.scalar(
        select(Administrador).where(
            Administrador.usuario == usuario
        )
    )

    if administrador:
        return

    nuevo_administrador = Administrador(
        usuario=usuario,
        contrasena_hash=hash_password(contrasena),
        activo=True,
    )

    db.add(nuevo_administrador)
    db.commit()
    logger.info("Administrador inicial creado: %s", usuario)
