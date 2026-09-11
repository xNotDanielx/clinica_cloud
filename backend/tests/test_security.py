import base64
import hashlib
import os
from types import SimpleNamespace

from app.common.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_and_rehash_password,
    verify_password,
)


def test_argon2_password_round_trip():
    password = "una-clave-segura-123"
    stored_hash = hash_password(password)

    assert stored_hash.startswith("$argon2")
    assert verify_password(password, stored_hash)
    assert not verify_password("incorrecta", stored_hash)


def test_jwt_round_trip():
    administrador = SimpleNamespace(id=7, usuario="admin")
    token = create_access_token(administrador=administrador)

    payload = decode_access_token(token)

    assert payload["sub"] == "7"
    assert payload["usuario"] == "admin"


def test_invalid_password_does_not_rehash():
    stored_hash = hash_password("clave-correcta-123")

    valid, new_hash = verify_and_rehash_password(
        "clave-incorrecta",
        stored_hash,
    )

    assert valid is False
    assert new_hash is None


def test_legacy_pbkdf2_hash_is_accepted_and_upgraded():
    password = "legacy-password-123"
    iterations = 120_000
    salt = os.urandom(16)
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
    )

    def encode(value: bytes) -> str:
        return base64.urlsafe_b64encode(value).decode().rstrip("=")

    legacy_hash = (
        f"pbkdf2_sha256${iterations}$"
        f"{encode(salt)}${encode(derived)}"
    )

    valid, new_hash = verify_and_rehash_password(
        password,
        legacy_hash,
    )

    assert valid is True
    assert new_hash is not None
    assert new_hash.startswith("$argon2")
