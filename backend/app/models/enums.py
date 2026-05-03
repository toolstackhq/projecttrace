from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    EDITOR = "EDITOR"


class EpicStatus(str, Enum):
    PLANNED = "PLANNED"
    ACTIVE = "ACTIVE"
    DONE = "DONE"
    BLOCKED = "BLOCKED"


class FeatureStatus(str, Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    BLOCKED = "BLOCKED"


class RequirementStatus(str, Enum):
    DRAFT = "DRAFT"
    READY = "READY"
    IN_PROGRESS = "IN_PROGRESS"
    VERIFIED = "VERIFIED"
    BLOCKED = "BLOCKED"


class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TestCaseAutomationStatus(str, Enum):
    NOT_AUTOMATED = "NOT_AUTOMATED"
    PLANNED = "PLANNED"
    AUTOMATED = "AUTOMATED"
    BROKEN = "BROKEN"


class TestRunStatus(str, Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"
    SKIPPED = "SKIPPED"


class BugSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class BugStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
