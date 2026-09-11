from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.exceptions import (
    ConflictError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
)
from app.common.security import (
    create_access_token,
    hash_password,
    verify_and_rehash_password,
)
from app.models.administrador import Administrador


MIN_ADMIN_PASSWORD_LENGTH = 12


class AdministradorService:
    @staticmethod
    def crear_administrador(
        session: Session,
        *,
        usuario: str,
        contrasena: str,
    ) -> Administrador:
        usuario_limpio = usuario.strip()

        if not usuario_limpio:
            raise ValidationError("El usuario es obligatorio")
        if len(contrasena) < MIN_ADMIN_PASSWORD_LENGTH:
            raise ValidationError(
                f"La contraseña debe tener al menos {MIN_ADMIN_PASSWORD_LENGTH} caracteres"
            )

        existente = session.scalar(
            select(Administrador).where(Administrador.usuario == usuario_limpio)
        )
        if existente:
            raise ConflictError("Ya existe un administrador con ese usuario")

        administrador = Administrador(
            usuario=usuario_limpio,
            contrasena_hash=hash_password(contrasena),
            activo=True,
            ultimo_acceso=None,
        )
        session.add(administrador)
        session.flush()
        session.refresh(administrador)
        return administrador

    @staticmethod
    def autenticar(
        session: Session,
        *,
        usuario: str,
        contrasena: str,
    ) -> tuple[Administrador, str]:
        usuario_limpio = usuario.strip()

        administrador = session.scalar(
            select(Administrador).where(Administrador.usuario == usuario_limpio)
        )
        if not administrador or not administrador.activo:
            raise UnauthorizedError("Usuario o contraseña inválidos")

        valid, upgraded_hash = verify_and_rehash_password(
            contrasena,
            administrador.contrasena_hash,
        )
        if not valid:
            raise UnauthorizedError("Usuario o contraseña inválidos")

        if upgraded_hash:
            administrador.contrasena_hash = upgraded_hash

        administrador.ultimo_acceso = datetime.now(UTC)
        session.add(administrador)
        session.flush()
        session.refresh(administrador)

        token = create_access_token(administrador=administrador)
        return administrador, token

    @staticmethod
    def obtener_por_id(
        session: Session,
        administrador_id: int,
    ) -> Administrador:
        administrador = session.get(Administrador, administrador_id)
        if not administrador:
            raise NotFoundError("Administrador no encontrado")
        return administrador
