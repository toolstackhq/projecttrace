"""add user roles

Revision ID: 0002_user_roles
Revises: 0001_initial
Create Date: 2026-05-02
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0002_user_roles"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("role", sa.String(length=20), nullable=False, server_default=sa.text("'EDITOR'")),
    )


def downgrade() -> None:
    op.drop_column("users", "role")
