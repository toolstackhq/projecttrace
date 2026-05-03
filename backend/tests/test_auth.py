from __future__ import annotations

from fastapi import HTTPException

from app.core import auth, security
from app.models.entities import User
from app.models.enums import UserRole


class FakeSettings:
    jwt_secret_key = "unit-test-secret-key-unit-test-secret-key"
    jwt_algorithm = "HS256"
    access_token_expire_minutes = 30


def use_fake_settings(monkeypatch):
    monkeypatch.setattr(security, "get_settings", lambda: FakeSettings())


def make_user(user_id: int = 1, role: str = UserRole.ADMIN.value) -> User:
    return User(
        id=user_id,
        name=f"User {user_id}",
        email=f"user{user_id}@example.com",
        role=role,
        password_hash="hash",
    )


def test_extract_bearer_token_returns_token():
    assert auth._extract_bearer_token("Bearer abc123") == "abc123"


def test_extract_bearer_token_returns_none_for_missing_header():
    assert auth._extract_bearer_token(None) is None


def test_extract_bearer_token_rejects_invalid_scheme():
    try:
        auth._extract_bearer_token("Token abc123")
    except HTTPException as exc:
        assert exc.status_code == 401
    else:
        raise AssertionError("Expected HTTPException")


def test_user_from_token_returns_matching_user(db_session, monkeypatch):
    use_fake_settings(monkeypatch)
    db_session.add(make_user())
    db_session.commit()
    token = security.create_access_token({"sub": "1"})
    user = auth._user_from_token(db_session, token)
    assert user.id == 1
    assert user.email == "user1@example.com"


def test_user_from_token_rejects_missing_subject(db_session, monkeypatch):
    use_fake_settings(monkeypatch)
    token = security.create_access_token({"role": "ADMIN"})
    try:
        auth._user_from_token(db_session, token)
    except HTTPException as exc:
        assert exc.status_code == 401
        assert exc.detail == "Invalid token subject"
    else:
        raise AssertionError("Expected HTTPException")


def test_user_from_token_rejects_non_numeric_subject(db_session, monkeypatch):
    use_fake_settings(monkeypatch)
    token = security.create_access_token({"sub": "abc"})
    try:
        auth._user_from_token(db_session, token)
    except HTTPException as exc:
        assert exc.status_code == 401
        assert exc.detail == "Invalid token subject"
    else:
        raise AssertionError("Expected HTTPException")


def test_user_from_token_rejects_missing_user(db_session, monkeypatch):
    use_fake_settings(monkeypatch)
    token = security.create_access_token({"sub": "99"})
    try:
        auth._user_from_token(db_session, token)
    except HTTPException as exc:
        assert exc.status_code == 401
        assert exc.detail == "User no longer exists"
    else:
        raise AssertionError("Expected HTTPException")


def test_get_optional_current_user_returns_none_without_token(db_session):
    assert auth.get_optional_current_user(db_session, None) is None


def test_get_optional_current_user_returns_none_for_invalid_token(db_session):
    assert auth.get_optional_current_user(db_session, "Bearer invalid") is None


def test_get_current_user_requires_bootstrap_when_database_is_empty(db_session):
    try:
        auth.get_current_user(db_session, None)
    except HTTPException as exc:
        assert exc.status_code == 401
        assert exc.detail == "Bootstrap admin creation required"
    else:
        raise AssertionError("Expected HTTPException")


def test_get_current_user_requires_auth_when_users_exist(db_session):
    db_session.add(make_user())
    db_session.commit()
    try:
        auth.get_current_user(db_session, None)
    except HTTPException as exc:
        assert exc.status_code == 401
        assert exc.detail == "Authentication required"
    else:
        raise AssertionError("Expected HTTPException")


def test_require_admin_accepts_admin_user():
    user = make_user(role=UserRole.ADMIN.value)
    assert auth.require_admin(user) is user


def test_require_admin_rejects_editor_user():
    user = make_user(role=UserRole.EDITOR.value)
    try:
        auth.require_admin(user)
    except HTTPException as exc:
        assert exc.status_code == 403
        assert exc.detail == "Admin access required"
    else:
        raise AssertionError("Expected HTTPException")
