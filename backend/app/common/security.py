from __future__ import annotations

import base64
import hashlib
import hmac
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.common.exceptions import UnauthorizedError
from app.core.config import get_settings
from app.db.database import SessionLocal
from app.models.administrador import Administrador


JWT_ALGORITHM = "HS256"
LEGACY_PBKDF2_PREFIX = "pbkdf2_sha256$"

_password_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=19_456,
    parallelism=1,
    hash_len=32,
    salt_len=16,
)

bearer_scheme = HTTPBearer(auto_error=False)


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}")


def _verify_legacy_pbkdf2(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations_str, salt_b64, derived_b64 = stored_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False

        iterations = int(iterations_str)
        salt = _b64decode(salt_b64)
        expected_derived = _b64decode(derived_b64)
    except (ValueError, TypeError):
        return False

    candidate_derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
    )
    return hmac.compare_digest(candidate_derived, expected_derived)


def hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    if stored_hash.startswith(LEGACY_PBKDF2_PREFIX):
        return _verify_legacy_pbkdf2(password, stored_hash)

    try:
        return _password_hasher.verify(stored_hash, password)
    except (VerificationError, InvalidHashError):
        return False


def verify_and_rehash_password(
    password: str,
    stored_hash: str,
) -> tuple[bool, str | None]:
    if stored_hash.startswith(LEGACY_PBKDF2_PREFIX):
        if not _verify_legacy_pbkdf2(password, stored_hash):
            return False, None
        return True, hash_password(password)

    try:
        valid = _password_hasher.verify(stored_hash, password)
    except (VerificationError, InvalidHashError):
        return False, None

    if valid and _password_hasher.check_needs_rehash(stored_hash):
        return True, hash_password(password)

    return valid, None


def create_access_token(*, administrador: Administrador) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    expires_at = now + timedelta(hours=settings.token_expires_hours)

    payload = {
        "sub": str(administrador.id),
        "usuario": administrador.usuario,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }

    return jwt.encode(
        payload,
        settings.admin_auth_secret,
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()

    try:
        payload = jwt.decode(
            token,
            settings.admin_auth_secret,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "iat", "exp"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise UnauthorizedError("Token expirado. Vuelve a iniciar sesión") from exc
    except jwt.InvalidTokenError as exc:
        raise UnauthorizedError("Token inválido o mal formado") from exc

    return payload


def get_current_administrador(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Administrador:
    if not credentials:
        raise UnauthorizedError("Falta el encabezado Authorization")

    payload = decode_access_token(credentials.credentials)
    administrador_id = payload.get("sub")

    try:
        administrador_pk = int(administrador_id)
    except (TypeError, ValueError) as exc:
        raise UnauthorizedError("Token inválido o mal formado") from exc

    with SessionLocal() as session:
        administrador = session.get(Administrador, administrador_pk)
        if not administrador or not administrador.activo:
            raise UnauthorizedError("Administrador no autorizado o inactivo")

        session.expunge(administrador)
        return administrador
