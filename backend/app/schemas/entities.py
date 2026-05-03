from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

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
from app.schemas.common import ActivitySnapshot, ORMBase


class UserBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    role: UserRole = UserRole.EDITOR


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRead(UserBase, ORMBase):
    id: int
    created_at: datetime


class ProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    owner_id: int


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    owner_id: int | None = None


class ProjectRead(ProjectBase, ORMBase):
    id: int
    created_at: datetime
    updated_at: datetime
    owner: UserRead | None = None


class EpicBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    project_id: int
    status: EpicStatus = EpicStatus.PLANNED
    owner_id: int


class EpicCreate(EpicBase):
    pass


class EpicUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    project_id: int | None = None
    status: EpicStatus | None = None
    owner_id: int | None = None


class EpicRead(EpicBase, ORMBase):
    id: int
    created_at: datetime
    updated_at: datetime
    project: ProjectRead | None = None
    owner: UserRead | None = None


class FeatureBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    epic_id: int
    project_id: int
    status: FeatureStatus = FeatureStatus.PLANNED
    owner_id: int


class FeatureCreate(FeatureBase):
    pass


class FeatureUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    epic_id: int | None = None
    project_id: int | None = None
    status: FeatureStatus | None = None
    owner_id: int | None = None


class FeatureRead(FeatureBase, ORMBase):
    id: int
    created_at: datetime
    updated_at: datetime
    project: ProjectRead | None = None
    epic: EpicRead | None = None
    owner: UserRead | None = None


class RequirementBase(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    description: str | None = None
    feature_id: int
    project_id: int
    priority: Priority = Priority.MEDIUM
    status: RequirementStatus = RequirementStatus.DRAFT
    created_by: int | None = None


class RequirementCreate(RequirementBase):
    pass


class RequirementUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=240)
    description: str | None = None
    feature_id: int | None = None
    project_id: int | None = None
    priority: Priority | None = None
    status: RequirementStatus | None = None
    created_by: int | None = None


class RequirementRead(RequirementBase, ORMBase):
    id: int
    created_at: datetime
    updated_at: datetime
    project: ProjectRead | None = None
    feature: FeatureRead | None = None
    creator: UserRead | None = None


class TestCaseBase(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    description: str | None = None
    priority: Priority = Priority.MEDIUM
    project_id: int
    automation_status: TestCaseAutomationStatus = TestCaseAutomationStatus.NOT_AUTOMATED
    automated_test_name: str | None = Field(default=None, max_length=255)


class TestCaseCreate(TestCaseBase):
    pass


class TestCaseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=240)
    description: str | None = None
    priority: Priority | None = None
    project_id: int | None = None
    automation_status: TestCaseAutomationStatus | None = None
    automated_test_name: str | None = Field(default=None, max_length=255)


class TestCaseRead(TestCaseBase, ORMBase):
    id: int
    created_at: datetime
    automation_linked_at: datetime | None = None
    project: ProjectRead | None = None


class TestRunBase(BaseModel):
    project_id: int
    test_case_id: int
    status: TestRunStatus = TestRunStatus.SKIPPED
    executed_by: int | None = None


class TestRunCreate(TestRunBase):
    pass


class TestRunUpdate(BaseModel):
    project_id: int | None = None
    test_case_id: int | None = None
    status: TestRunStatus | None = None
    executed_by: int | None = None


class TestRunRead(TestRunBase, ORMBase):
    id: int
    executed_at: datetime
    project: ProjectRead | None = None
    test_case: TestCaseRead | None = None
    executed_by_user: UserRead | None = None


class BugBase(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    description: str | None = None
    severity: BugSeverity = BugSeverity.MEDIUM
    status: BugStatus = BugStatus.OPEN
    project_id: int
    assignee_id: int | None = None
    reporter_id: int | None = None


class BugCreate(BugBase):
    pass


class BugUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=240)
    description: str | None = None
    severity: BugSeverity | None = None
    status: BugStatus | None = None
    project_id: int | None = None
    assignee_id: int | None = None
    reporter_id: int | None = None


class BugRead(BugBase, ORMBase):
    id: int
    created_at: datetime
    updated_at: datetime
    project: ProjectRead | None = None
    assignee: UserRead | None = None
    reporter: UserRead | None = None


class CommentBase(BaseModel):
    bug_id: int
    content: str = Field(min_length=1)


class CommentCreate(CommentBase):
    user_id: int | None = None


class CommentRead(CommentBase, ORMBase):
    id: int
    user_id: int
    created_at: datetime
    user: UserRead | None = None


class ActivityLogRead(ORMBase):
    id: int
    entity_type: str
    entity_id: int
    action: str
    user_id: int | None
    project_id: int | None
    timestamp: datetime
    user: UserRead | None = None
    project: ProjectRead | None = None


class ProjectDetail(ProjectRead):
    epics: list[EpicRead] = Field(default_factory=list)
    features: list[FeatureRead] = Field(default_factory=list)
    requirements: list[RequirementRead] = Field(default_factory=list)
    test_cases: list[TestCaseRead] = Field(default_factory=list)
    bugs: list[BugRead] = Field(default_factory=list)
    activity: list[ActivityLogRead] = Field(default_factory=list)


class EpicDetail(EpicRead):
    features: list[FeatureRead] = Field(default_factory=list)
    activity: list[ActivityLogRead] = Field(default_factory=list)


class FeatureDetail(FeatureRead):
    requirements: list[RequirementRead] = Field(default_factory=list)
    activity: list[ActivityLogRead] = Field(default_factory=list)


class RequirementDetail(RequirementRead):
    test_cases: list[TestCaseRead] = Field(default_factory=list)
    bugs: list[BugRead] = Field(default_factory=list)
    activity: list[ActivityLogRead] = Field(default_factory=list)


class TestCaseDetail(TestCaseRead):
    requirements: list[RequirementRead] = Field(default_factory=list)
    test_runs: list[TestRunRead] = Field(default_factory=list)


class BugDetail(BugRead):
    requirements: list[RequirementRead] = Field(default_factory=list)
    comments: list[CommentRead] = Field(default_factory=list)
    activity: list[ActivityLogRead] = Field(default_factory=list)


class ActivityFilters(BaseModel):
    project_id: int | None = None
    entity_type: str | None = None
    action: str | None = None
    user_id: int | None = None


class SummaryCounts(BaseModel):
    totals: dict[str, int]
    bug_status: list[dict[str, int | str]]
    requirement_status: list[dict[str, int | str]]
    test_run_status: list[dict[str, int | str]]
