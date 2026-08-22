from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.common.exceptions import UnauthorizedError
from app.db.database import SessionLocal
from app.models.administrador import Administrador

PBKDF2_ITERATIONS = 120_000
TOKEN_EXPIRES_HOURS = 8
TOKEN_SECRET = os.getenv(
    "ADMIN_AUTH_SECRET",
    "cambiar-este-secret-en-produccion",
)

bearer_scheme = HTTPBearer(auto_error=False)


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}")


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return "pbkdf2_sha256${}${}${}".format(
        PBKDF2_ITERATIONS,
        _b64encode(salt),
        _b64encode(derived_key),
    )


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations_str, salt_b64, derived_b64 = stored_hash.split("$")
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    try:
        iterations = int(iterations_str)
    except ValueError:
        return False

    salt = _b64decode(salt_b64)
    expected_derived = _b64decode(derived_b64)
    candidate_derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
    )
    return hmac.compare_digest(candidate_derived, expected_derived)


def _sign(payload: bytes) -> str:
    signature = hmac.new(TOKEN_SECRET.encode("utf-8"), payload, hashlib.sha256).digest()
    return _b64encode(signature)


def create_access_token(*, administrador: Administrador) -> str:
    exp = datetime.now(UTC) + timedelta(hours=TOKEN_EXPIRES_HOURS)
    payload = {
        "sub": str(administrador.id),
        "usuario": administrador.usuario,
        "exp": int(exp.timestamp()),
    }
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return f"{_b64encode(payload_bytes)}.{_sign(payload_bytes)}"


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload_b64, signature = token.split(".")
        payload_bytes = _b64decode(payload_b64)
    except ValueError as exc:
        raise UnauthorizedError("Token inválido o mal formado") from exc

    expected_signature = _sign(payload_bytes)
    if not hmac.compare_digest(signature, expected_signature):
        raise UnauthorizedError("Token inválido o alterado")

    try:
        payload = json.loads(payload_bytes.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise UnauthorizedError("Token inválido o mal formado") from exc

    exp = payload.get("exp")
    if not isinstance(exp, int) or datetime.now(UTC).timestamp() > exp:
        raise UnauthorizedError("Token expirado. Vuelve a iniciar sesión")

    return payload


def get_current_administrador(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Administrador:
    if not credentials:
        raise UnauthorizedError("Falta el encabezado Authorization")

    payload = decode_access_token(credentials.credentials)
    administrador_id = payload.get("sub")
    if administrador_id is None:
        raise UnauthorizedError("Token inválido o mal formado")

    with SessionLocal() as session:
        try:
            administrador_pk = int(administrador_id)
        except (TypeError, ValueError) as exc:
            raise UnauthorizedError("Token inválido o mal formado") from exc

        administrador = session.get(Administrador, administrador_pk)
        if not administrador or not administrador.activo:
            raise UnauthorizedError("Administrador no autorizado o inactivo")
        session.expunge(administrador)
        return administrador