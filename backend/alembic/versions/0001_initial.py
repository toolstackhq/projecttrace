"""initial schema for ProjectTrace

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-02
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_name", "users", ["name"])
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "projects",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("owner_id", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_projects_name", "projects", ["name"])
    op.create_index("ix_projects_owner_id", "projects", ["owner_id"])
    op.create_index("ix_projects_created_at", "projects", ["created_at"])

    op.create_table(
        "epics",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("project_id", sa.BigInteger(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("owner_id", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_epics_title", "epics", ["title"])
    op.create_index("ix_epics_project_id", "epics", ["project_id"])
    op.create_index("ix_epics_owner_id", "epics", ["owner_id"])
    op.create_index("ix_epics_created_at", "epics", ["created_at"])

    op.create_table(
        "features",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("epic_id", sa.BigInteger(), sa.ForeignKey("epics.id"), nullable=False),
        sa.Column("project_id", sa.BigInteger(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("owner_id", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_features_title", "features", ["title"])
    op.create_index("ix_features_project_id", "features", ["project_id"])
    op.create_index("ix_features_epic_id", "features", ["epic_id"])
    op.create_index("ix_features_owner_id", "features", ["owner_id"])
    op.create_index("ix_features_created_at", "features", ["created_at"])

    op.create_table(
        "requirements",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("feature_id", sa.BigInteger(), sa.ForeignKey("features.id"), nullable=False),
        sa.Column("project_id", sa.BigInteger(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("priority", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_requirements_title", "requirements", ["title"])
    op.create_index("ix_requirements_project_id", "requirements", ["project_id"])
    op.create_index("ix_requirements_feature_id", "requirements", ["feature_id"])
    op.create_index("ix_requirements_created_by", "requirements", ["created_by"])
    op.create_index("ix_requirements_status", "requirements", ["status"])
    op.create_index("ix_requirements_priority", "requirements", ["priority"])
    op.create_index("ix_requirements_created_at", "requirements", ["created_at"])

    op.create_table(
        "test_cases",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("priority", sa.String(length=40), nullable=False),
        sa.Column("project_id", sa.BigInteger(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_test_cases_title", "test_cases", ["title"])
    op.create_index("ix_test_cases_project_id", "test_cases", ["project_id"])
    op.create_index("ix_test_cases_priority", "test_cases", ["priority"])
    op.create_index("ix_test_cases_created_at", "test_cases", ["created_at"])

    op.create_table(
        "test_runs",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("project_id", sa.BigInteger(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("test_case_id", sa.BigInteger(), sa.ForeignKey("test_cases.id"), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("executed_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("executed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_test_runs_project_id", "test_runs", ["project_id"])
    op.create_index("ix_test_runs_test_case_id", "test_runs", ["test_case_id"])
    op.create_index("ix_test_runs_status", "test_runs", ["status"])
    op.create_index("ix_test_runs_executed_at", "test_runs", ["executed_at"])

    op.create_table(
        "bugs",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("severity", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("project_id", sa.BigInteger(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("assignee_id", sa.BigInteger(), sa.ForeignKey("users.id")),
        sa.Column("reporter_id", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_bugs_title", "bugs", ["title"])
    op.create_index("ix_bugs_project_id", "bugs", ["project_id"])
    op.create_index("ix_bugs_assignee_id", "bugs", ["assignee_id"])
    op.create_index("ix_bugs_reporter_id", "bugs", ["reporter_id"])
    op.create_index("ix_bugs_status", "bugs", ["status"])
    op.create_index("ix_bugs_severity", "bugs", ["severity"])
    op.create_index("ix_bugs_created_at", "bugs", ["created_at"])

    op.create_table(
        "comments",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("bug_id", sa.BigInteger(), sa.ForeignKey("bugs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_comments_bug_id", "comments", ["bug_id"])
    op.create_index("ix_comments_user_id", "comments", ["user_id"])
    op.create_index("ix_comments_created_at", "comments", ["created_at"])

    op.create_table(
        "activity_logs",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("entity_type", sa.String(length=80), nullable=False),
        sa.Column("entity_id", sa.BigInteger(), nullable=False),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id")),
        sa.Column("project_id", sa.BigInteger(), sa.ForeignKey("projects.id")),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_activity_logs_entity", "activity_logs", ["entity_type", "entity_id"])
    op.create_index("ix_activity_logs_user_id", "activity_logs", ["user_id"])
    op.create_index("ix_activity_logs_timestamp", "activity_logs", ["timestamp"])

    op.create_table(
        "requirements_test_cases",
        sa.Column("requirement_id", sa.BigInteger(), sa.ForeignKey("requirements.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("test_case_id", sa.BigInteger(), sa.ForeignKey("test_cases.id", ondelete="CASCADE"), primary_key=True),
    )
    op.create_table(
        "requirements_bugs",
        sa.Column("requirement_id", sa.BigInteger(), sa.ForeignKey("requirements.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("bug_id", sa.BigInteger(), sa.ForeignKey("bugs.id", ondelete="CASCADE"), primary_key=True),
    )

    op.create_table(
        "pull_request_links",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("provider", sa.String(length=80), nullable=False),
        sa.Column("repository", sa.String(length=255), nullable=False),
        sa.Column("pr_number", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("status", sa.String(length=80), nullable=False),
        sa.Column("requirement_id", sa.BigInteger(), sa.ForeignKey("requirements.id")),
        sa.Column("bug_id", sa.BigInteger(), sa.ForeignKey("bugs.id")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_pull_request_links_requirement_id", "pull_request_links", ["requirement_id"])
    op.create_index("ix_pull_request_links_bug_id", "pull_request_links", ["bug_id"])
    op.create_index("ix_pull_request_links_provider_repo", "pull_request_links", ["provider", "repository"])


def downgrade() -> None:
    op.drop_index("ix_pull_request_links_provider_repo", table_name="pull_request_links")
    op.drop_index("ix_pull_request_links_bug_id", table_name="pull_request_links")
    op.drop_index("ix_pull_request_links_requirement_id", table_name="pull_request_links")
    op.drop_table("pull_request_links")
    op.drop_table("requirements_bugs")
    op.drop_table("requirements_test_cases")
    op.drop_index("ix_activity_logs_timestamp", table_name="activity_logs")
    op.drop_index("ix_activity_logs_user_id", table_name="activity_logs")
    op.drop_index("ix_activity_logs_entity", table_name="activity_logs")
    op.drop_table("activity_logs")
    op.drop_index("ix_comments_created_at", table_name="comments")
    op.drop_index("ix_comments_user_id", table_name="comments")
    op.drop_index("ix_comments_bug_id", table_name="comments")
    op.drop_table("comments")
    op.drop_index("ix_bugs_created_at", table_name="bugs")
    op.drop_index("ix_bugs_severity", table_name="bugs")
    op.drop_index("ix_bugs_status", table_name="bugs")
    op.drop_index("ix_bugs_reporter_id", table_name="bugs")
    op.drop_index("ix_bugs_assignee_id", table_name="bugs")
    op.drop_index("ix_bugs_project_id", table_name="bugs")
    op.drop_index("ix_bugs_title", table_name="bugs")
    op.drop_table("bugs")
    op.drop_index("ix_test_runs_executed_at", table_name="test_runs")
    op.drop_index("ix_test_runs_status", table_name="test_runs")
    op.drop_index("ix_test_runs_test_case_id", table_name="test_runs")
    op.drop_index("ix_test_runs_project_id", table_name="test_runs")
    op.drop_table("test_runs")
    op.drop_index("ix_test_cases_created_at", table_name="test_cases")
    op.drop_index("ix_test_cases_priority", table_name="test_cases")
    op.drop_index("ix_test_cases_project_id", table_name="test_cases")
    op.drop_index("ix_test_cases_title", table_name="test_cases")
    op.drop_table("test_cases")
    op.drop_index("ix_requirements_created_at", table_name="requirements")
    op.drop_index("ix_requirements_priority", table_name="requirements")
    op.drop_index("ix_requirements_status", table_name="requirements")
    op.drop_index("ix_requirements_created_by", table_name="requirements")
    op.drop_index("ix_requirements_feature_id", table_name="requirements")
    op.drop_index("ix_requirements_project_id", table_name="requirements")
    op.drop_index("ix_requirements_title", table_name="requirements")
    op.drop_table("requirements")
    op.drop_index("ix_features_created_at", table_name="features")
    op.drop_index("ix_features_owner_id", table_name="features")
    op.drop_index("ix_features_epic_id", table_name="features")
    op.drop_index("ix_features_project_id", table_name="features")
    op.drop_index("ix_features_title", table_name="features")
    op.drop_table("features")
    op.drop_index("ix_epics_created_at", table_name="epics")
    op.drop_index("ix_epics_owner_id", table_name="epics")
    op.drop_index("ix_epics_project_id", table_name="epics")
    op.drop_index("ix_epics_title", table_name="epics")
    op.drop_table("epics")
    op.drop_index("ix_projects_created_at", table_name="projects")
    op.drop_index("ix_projects_owner_id", table_name="projects")
    op.drop_index("ix_projects_name", table_name="projects")
    op.drop_table("projects")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_name", table_name="users")
    op.drop_table("users")

