from __future__ import annotations

from datetime import timedelta

import jwt

from app.core import security


class FakeSettings:
    jwt_secret_key = "unit-test-secret-key-unit-test-secret-key"
    jwt_algorithm = "HS256"
    access_token_expire_minutes = 30


def use_fake_settings(monkeypatch):
    monkeypatch.setattr(security, "get_settings", lambda: FakeSettings())


def test_hash_password_uses_pbkdf2_prefix():
    hashed = security.hash_password("ProjectTrace123!")
    assert hashed.startswith("pbkdf2_sha256$")


def test_hash_password_has_four_parts():
    hashed = security.hash_password("ProjectTrace123!")
    assert len(hashed.split("$")) == 4


def test_hash_password_generates_different_salts():
    first = security.hash_password("ProjectTrace123!")
    second = security.hash_password("ProjectTrace123!")
    assert first != second


def test_verify_password_accepts_correct_password():
    hashed = security.hash_password("ProjectTrace123!")
    assert security.verify_password("ProjectTrace123!", hashed) is True


def test_verify_password_rejects_incorrect_password():
    hashed = security.hash_password("ProjectTrace123!")
    assert security.verify_password("wrong-password", hashed) is False


def test_verify_password_rejects_empty_hash():
    assert security.verify_password("ProjectTrace123!", "") is False


def test_verify_password_rejects_none_hash():
    assert security.verify_password("ProjectTrace123!", None) is False


def test_verify_password_rejects_malformed_hash():
    assert security.verify_password("ProjectTrace123!", "not-a-valid-hash") is False


def test_verify_password_rejects_wrong_scheme():
    assert security.verify_password("ProjectTrace123!", "bcrypt$260000$salt$hash") is False


def test_verify_password_rejects_non_numeric_iterations():
    assert security.verify_password("ProjectTrace123!", "pbkdf2_sha256$abc$salt$hash") is False


def test_create_access_token_round_trips_claims(monkeypatch):
    use_fake_settings(monkeypatch)
    token = security.create_access_token({"sub": "123", "role": "ADMIN"})
    claims = jwt.decode(token, FakeSettings.jwt_secret_key, algorithms=[FakeSettings.jwt_algorithm])
    assert claims["sub"] == "123"
    assert claims["role"] == "ADMIN"


def test_create_access_token_adds_issued_and_expiry_claims(monkeypatch):
    use_fake_settings(monkeypatch)
    token = security.create_access_token({"sub": "123"}, expires_delta=timedelta(minutes=1))
    claims = jwt.decode(token, FakeSettings.jwt_secret_key, algorithms=[FakeSettings.jwt_algorithm])
    assert "iat" in claims
    assert "exp" in claims
    assert claims["exp"] - claims["iat"] == 60
