from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.associations import requirements_bugs, requirements_test_cases
from app.models.enums import (
    BugSeverity,
    BugStatus,
    EpicStatus,
    FeatureStatus,
    Priority,
    RequirementStatus,
    TestCaseAutomationStatus,
    TestRunStatus,
    UserRole,
)

PK_TYPE = BigInteger().with_variant(Integer(), "sqlite")


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default=UserRole.EDITOR.value)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False, default="")

    projects = relationship("Project", back_populates="owner")
    epics = relationship("Epic", back_populates="owner")
    features = relationship("Feature", back_populates="owner")
    requirements_created = relationship("Requirement", back_populates="creator")
    test_runs_executed = relationship("TestRun", back_populates="executed_by_user")
    bugs_assigned = relationship("Bug", back_populates="assignee", foreign_keys="Bug.assignee_id")
    bugs_reported = relationship("Bug", back_populates="reporter", foreign_keys="Bug.reporter_id")
    comments = relationship("Comment", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")


class Project(Base, TimestampMixin):
    __tablename__ = "projects"
    __table_args__ = (
        Index("ix_projects_owner_id", "owner_id"),
        Index("ix_projects_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    owner = relationship("User", back_populates="projects")
    epics = relationship("Epic", back_populates="project", cascade="all, delete-orphan")
    features = relationship("Feature", back_populates="project", cascade="all, delete-orphan")
    requirements = relationship("Requirement", back_populates="project", cascade="all, delete-orphan")
    test_cases = relationship("TestCase", back_populates="project", cascade="all, delete-orphan")
    test_runs = relationship("TestRun", back_populates="project", cascade="all, delete-orphan")
    bugs = relationship("Bug", back_populates="project", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="project")


class Epic(Base, TimestampMixin):
    __tablename__ = "epics"
    __table_args__ = (
        Index("ix_epics_project_id", "project_id"),
        Index("ix_epics_owner_id", "owner_id"),
        Index("ix_epics_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default=EpicStatus.PLANNED.value)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    project = relationship("Project", back_populates="epics")
    owner = relationship("User", back_populates="epics")
    features = relationship("Feature", back_populates="epic", cascade="all, delete-orphan")


class Feature(Base, TimestampMixin):
    __tablename__ = "features"
    __table_args__ = (
        Index("ix_features_project_id", "project_id"),
        Index("ix_features_epic_id", "epic_id"),
        Index("ix_features_owner_id", "owner_id"),
        Index("ix_features_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    epic_id: Mapped[int] = mapped_column(ForeignKey("epics.id"), nullable=False)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default=FeatureStatus.PLANNED.value)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    epic = relationship("Epic", back_populates="features")
    project = relationship("Project", back_populates="features")
    owner = relationship("User", back_populates="features")
    requirements = relationship("Requirement", back_populates="feature", cascade="all, delete-orphan")


class Requirement(Base, TimestampMixin):
    __tablename__ = "requirements"
    __table_args__ = (
        Index("ix_requirements_project_id", "project_id"),
        Index("ix_requirements_feature_id", "feature_id"),
        Index("ix_requirements_created_by", "created_by"),
        Index("ix_requirements_status", "status"),
        Index("ix_requirements_priority", "priority"),
        Index("ix_requirements_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(240), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    feature_id: Mapped[int] = mapped_column(ForeignKey("features.id"), nullable=False)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    priority: Mapped[str] = mapped_column(String(40), nullable=False, default=Priority.MEDIUM.value)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default=RequirementStatus.DRAFT.value)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    feature = relationship("Feature", back_populates="requirements")
    project = relationship("Project", back_populates="requirements")
    creator = relationship("User", back_populates="requirements_created")
    test_cases = relationship("TestCase", secondary=requirements_test_cases, back_populates="requirements")
    bugs = relationship("Bug", secondary=requirements_bugs, back_populates="requirements")


class TestCase(Base, TimestampMixin):
    __tablename__ = "test_cases"
    __table_args__ = (
        Index("ix_test_cases_project_id", "project_id"),
        Index("ix_test_cases_priority", "priority"),
        Index("ix_test_cases_automation_status", "automation_status"),
        Index("ix_test_cases_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(240), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(String(40), nullable=False, default=Priority.MEDIUM.value)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    automation_status: Mapped[str] = mapped_column(
        String(40), nullable=False, default=TestCaseAutomationStatus.NOT_AUTOMATED.value
    )
    automated_test_name: Mapped[str | None] = mapped_column(String(255))
    automation_linked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    project = relationship("Project", back_populates="test_cases")
    requirements = relationship("Requirement", secondary=requirements_test_cases, back_populates="test_cases")
    test_runs = relationship("TestRun", back_populates="test_case")


class TestRun(Base):
    __tablename__ = "test_runs"
    __table_args__ = (
        Index("ix_test_runs_project_id", "project_id"),
        Index("ix_test_runs_test_case_id", "test_case_id"),
        Index("ix_test_runs_status", "status"),
        Index("ix_test_runs_executed_at", "executed_at"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    test_case_id: Mapped[int] = mapped_column(ForeignKey("test_cases.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default=TestRunStatus.SKIPPED.value)
    executed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    executed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    project = relationship("Project", back_populates="test_runs")
    test_case = relationship("TestCase", back_populates="test_runs")
    executed_by_user = relationship("User", back_populates="test_runs_executed")


class Bug(Base, TimestampMixin):
    __tablename__ = "bugs"
    __table_args__ = (
        Index("ix_bugs_project_id", "project_id"),
        Index("ix_bugs_assignee_id", "assignee_id"),
        Index("ix_bugs_reporter_id", "reporter_id"),
        Index("ix_bugs_status", "status"),
        Index("ix_bugs_severity", "severity"),
        Index("ix_bugs_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(240), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(40), nullable=False, default=BugSeverity.MEDIUM.value)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default=BugStatus.OPEN.value)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    assignee_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    reporter_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    project = relationship("Project", back_populates="bugs")
    assignee = relationship("User", back_populates="bugs_assigned", foreign_keys=[assignee_id])
    reporter = relationship("User", back_populates="bugs_reported", foreign_keys=[reporter_id])
    requirements = relationship("Requirement", secondary=requirements_bugs, back_populates="bugs")
    comments = relationship("Comment", back_populates="bug", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"
    __table_args__ = (
        Index("ix_comments_bug_id", "bug_id"),
        Index("ix_comments_user_id", "user_id"),
        Index("ix_comments_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    bug_id: Mapped[int] = mapped_column(ForeignKey("bugs.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    bug = relationship("Bug", back_populates="comments")
    user = relationship("User", back_populates="comments")


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    __table_args__ = (
        Index("ix_activity_logs_entity", "entity_type", "entity_id"),
        Index("ix_activity_logs_user_id", "user_id"),
        Index("ix_activity_logs_timestamp", "timestamp"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    entity_type: Mapped[str] = mapped_column(String(80), nullable=False)
    entity_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"))
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user = relationship("User", back_populates="activity_logs")
    project = relationship("Project", back_populates="activity_logs")


class PullRequestLink(Base):
    __tablename__ = "pull_request_links"
    __table_args__ = (
        Index("ix_pull_request_links_requirement_id", "requirement_id"),
        Index("ix_pull_request_links_bug_id", "bug_id"),
        Index("ix_pull_request_links_provider_repo", "provider", "repository"),
    )

    id: Mapped[int] = mapped_column(PK_TYPE, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(80), nullable=False)
    repository: Mapped[str] = mapped_column(String(255), nullable=False)
    pr_number: Mapped[int] = mapped_column(Integer, nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(80), nullable=False, default="OPEN")
    requirement_id: Mapped[int | None] = mapped_column(ForeignKey("requirements.id"))
    bug_id: Mapped[int | None] = mapped_column(ForeignKey("bugs.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
