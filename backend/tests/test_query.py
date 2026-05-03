from __future__ import annotations

from sqlalchemy import select

from app.models.entities import User
from app.models.enums import UserRole
from app.services.query import apply_in_filter, apply_pagination, apply_search, paginate


def seed_users(session):
    users = [
        User(id=1, name="Alpha One", email="alpha.one@example.com", role=UserRole.EDITOR.value, password_hash="hash"),
        User(id=2, name="Beta Two", email="beta.two@example.com", role=UserRole.EDITOR.value, password_hash="hash"),
        User(id=3, name="Gamma Three", email="gamma.three@example.com", role=UserRole.EDITOR.value, password_hash="hash"),
        User(id=4, name="Delta Four", email="delta.four@example.com", role=UserRole.EDITOR.value, password_hash="hash"),
        User(id=5, name="Epsilon Five", email="epsilon.five@example.com", role=UserRole.EDITOR.value, password_hash="hash"),
    ]
    session.add_all(users)
    session.commit()


def test_apply_pagination_uses_requested_page_and_size(db_session):
    seed_users(db_session)
    stmt, page, page_size = apply_pagination(select(User).order_by(User.id), page=2, page_size=2)
    rows = db_session.execute(stmt).scalars().all()
    assert page == 2
    assert page_size == 2
    assert [row.id for row in rows] == [3, 4]


def test_apply_pagination_clamps_page_to_one(db_session):
    seed_users(db_session)
    stmt, page, page_size = apply_pagination(select(User).order_by(User.id), page=0, page_size=2)
    rows = db_session.execute(stmt).scalars().all()
    assert page == 1
    assert page_size == 2
    assert [row.id for row in rows] == [1, 2]


def test_apply_pagination_clamps_page_size_to_minimum(db_session):
    seed_users(db_session)
    stmt, page, page_size = apply_pagination(select(User).order_by(User.id), page=1, page_size=0)
    rows = db_session.execute(stmt).scalars().all()
    assert page == 1
    assert page_size == 1
    assert [row.id for row in rows] == [1]


def test_apply_pagination_clamps_page_size_to_maximum(db_session):
    seed_users(db_session)
    stmt, page, page_size = apply_pagination(select(User).order_by(User.id), page=1, page_size=500)
    rows = db_session.execute(stmt).scalars().all()
    assert page_size == 100
    assert page == 1
    assert len(rows) == 5


def test_apply_search_with_none_returns_all_rows(db_session):
    seed_users(db_session)
    stmt = apply_search(select(User), [User.name, User.email], None)
    rows = db_session.execute(stmt).scalars().all()
    assert len(rows) == 5


def test_apply_search_with_empty_string_returns_all_rows(db_session):
    seed_users(db_session)
    stmt = apply_search(select(User), [User.name, User.email], "")
    rows = db_session.execute(stmt).scalars().all()
    assert len(rows) == 5


def test_apply_search_trims_whitespace_and_matches_name(db_session):
    seed_users(db_session)
    stmt = apply_search(select(User), [User.name, User.email], "  Alpha  ")
    rows = db_session.execute(stmt).scalars().all()
    assert [row.id for row in rows] == [1]


def test_apply_search_matches_email(db_session):
    seed_users(db_session)
    stmt = apply_search(select(User), [User.name, User.email], "gamma.three")
    rows = db_session.execute(stmt).scalars().all()
    assert [row.id for row in rows] == [3]


def test_apply_in_filter_with_none_keeps_all_rows(db_session):
    seed_users(db_session)
    stmt = apply_in_filter(select(User), User.email, None)
    rows = db_session.execute(stmt).scalars().all()
    assert len(rows) == 5


def test_apply_in_filter_with_empty_list_returns_no_rows(db_session):
    seed_users(db_session)
    stmt = apply_in_filter(select(User), User.email, [])
    rows = db_session.execute(stmt).scalars().all()
    assert rows == []


def test_paginate_returns_total_page_and_slice(db_session):
    seed_users(db_session)
    page = paginate(db_session, select(User).order_by(User.id), page=2, page_size=2)
    assert page.total == 5
    assert page.page == 2
    assert page.page_size == 2
    assert page.pages == 3
    assert [item.id for item in page.items] == [3, 4]


def test_paginate_returns_zero_pages_for_empty_dataset(db_session):
    page = paginate(db_session, select(User).order_by(User.id), page=1, page_size=10)
    assert page.total == 0
    assert page.pages == 0
    assert page.items == []
