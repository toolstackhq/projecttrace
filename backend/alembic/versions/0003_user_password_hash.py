"""add user password hash

Revision ID: 0003_user_password_hash
Revises: 0002_user_roles
Create Date: 2026-05-02
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from app.core.config import get_settings
from app.core.security import hash_password


revision = "0003_user_password_hash"
down_revision = "0002_user_roles"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("password_hash", sa.String(length=255), nullable=True, server_default=""),
    )
    settings = get_settings()
    bind = op.get_bind()
    bind.execute(
        sa.text("UPDATE users SET password_hash = :password_hash WHERE password_hash IS NULL OR password_hash = ''"),
        {"password_hash": hash_password(settings.seed_user_password)},
    )
    op.alter_column("users", "password_hash", existing_type=sa.String(length=255), nullable=False, server_default=None)


def downgrade() -> None:
    op.drop_column("users", "password_hash")
