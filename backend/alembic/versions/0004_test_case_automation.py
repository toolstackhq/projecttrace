"""add test case automation metadata

Revision ID: 0004_test_case_automation
Revises: 0003_user_password_hash
Create Date: 2026-05-02
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0004_test_case_automation"
down_revision = "0003_user_password_hash"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "test_cases",
        sa.Column("automation_status", sa.String(length=40), nullable=False, server_default=sa.text("'NOT_AUTOMATED'")),
    )
    op.add_column("test_cases", sa.Column("automated_test_name", sa.String(length=255), nullable=True))
    op.add_column("test_cases", sa.Column("automation_linked_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_test_cases_automation_status", "test_cases", ["automation_status"])
    op.alter_column(
        "test_cases",
        "automation_status",
        existing_type=sa.String(length=40),
        nullable=False,
        server_default=None,
    )


def downgrade() -> None:
    op.drop_index("ix_test_cases_automation_status", table_name="test_cases")
    op.drop_column("test_cases", "automation_linked_at")
    op.drop_column("test_cases", "automated_test_name")
    op.drop_column("test_cases", "automation_status")
