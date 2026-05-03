from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt

from app.core.config import get_settings

_PASSWORD_ITERATIONS = 260_000
_PASSWORD_ALGORITHM = "sha256"


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        _PASSWORD_ALGORITHM,
        password.encode("utf-8"),
        salt.encode("utf-8"),
        _PASSWORD_ITERATIONS,
    )
    return f"pbkdf2_{_PASSWORD_ALGORITHM}${_PASSWORD_ITERATIONS}${salt}${digest.hex()}"


def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    try:
        scheme, iterations, salt, expected = password_hash.split("$", 3)
        iterations_int = int(iterations)
    except ValueError:
        return False
    if scheme != f"pbkdf2_{_PASSWORD_ALGORITHM}":
        return False
    candidate = hashlib.pbkdf2_hmac(
        _PASSWORD_ALGORITHM,
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations_int,
    ).hex()
    return hmac.compare_digest(candidate, expected)


def create_access_token(claims: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    settings = get_settings()
    payload = claims.copy()
    now = datetime.now(UTC)
    expire = now + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    payload.update({"iat": now, "exp": expire})
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
