from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.exceptions import ConflictError, NotFoundError, UnauthorizedError, ValidationError
from app.common.security import create_access_token, hash_password, verify_password
from app.models.administrador import Administrador


class AdministradorService:
    @staticmethod
    def crear_administrador(session: Session, *, usuario: str, contrasena: str) -> Administrador:
        usuario_limpio = usuario.strip()
        if not usuario_limpio:
            raise ValidationError("El usuario es obligatorio")
        if not contrasena:
            raise ValidationError("La contraseña es obligatoria")

        with session.begin():
            existente = session.scalar(select(Administrador).where(Administrador.usuario == usuario_limpio))
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
    def autenticar(session: Session, *, usuario: str, contrasena: str) -> tuple[Administrador, str]:
        usuario_limpio = usuario.strip()
        with session.begin():
            administrador = session.scalar(select(Administrador).where(Administrador.usuario == usuario_limpio))
            if not administrador or not administrador.activo:
                raise UnauthorizedError("Usuario o contraseña inválidos")
            if not verify_password(contrasena, administrador.contrasena_hash):
                raise UnauthorizedError("Usuario o contraseña inválidos")

            administrador.ultimo_acceso = datetime.now(UTC)
            session.add(administrador)
            session.flush()
            session.refresh(administrador)

        token = create_access_token(administrador=administrador)
        return administrador, token

    @staticmethod
    def obtener_por_id(session: Session, administrador_id: int) -> Administrador:
        administrador = session.get(Administrador, administrador_id)
        if not administrador:
            raise NotFoundError("Administrador no encontrado")
        return administrador