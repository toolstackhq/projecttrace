from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import Bug, Requirement, TestCase
from app.services.activity import record_activity
from app.services.query import not_found


def link_requirement_test_case(db: Session, requirement_id: int, test_case_id: int, user_id: int | None = None) -> None:
    requirement = db.get(Requirement, requirement_id)
    if requirement is None:
        raise not_found("Requirement not found")
    test_case = db.get(TestCase, test_case_id)
    if test_case is None:
        raise not_found("Test case not found")
    if test_case not in requirement.test_cases:
        requirement.test_cases.append(test_case)
        record_activity(
            db,
            entity_type="Requirement",
            entity_id=requirement.id,
            action=f"linked test case {test_case_id}",
            user_id=user_id,
            project_id=requirement.project_id,
        )


def unlink_requirement_test_case(db: Session, requirement_id: int, test_case_id: int, user_id: int | None = None) -> None:
    requirement = db.get(Requirement, requirement_id)
    if requirement is None:
        raise not_found("Requirement not found")
    test_case = db.get(TestCase, test_case_id)
    if test_case is None:
        raise not_found("Test case not found")
    if test_case in requirement.test_cases:
        requirement.test_cases.remove(test_case)
        record_activity(
            db,
            entity_type="Requirement",
            entity_id=requirement.id,
            action=f"unlinked test case {test_case_id}",
            user_id=user_id,
            project_id=requirement.project_id,
        )


def link_requirement_bug(db: Session, requirement_id: int, bug_id: int, user_id: int | None = None) -> None:
    requirement = db.get(Requirement, requirement_id)
    if requirement is None:
        raise not_found("Requirement not found")
    bug = db.get(Bug, bug_id)
    if bug is None:
        raise not_found("Bug not found")
    if bug not in requirement.bugs:
        requirement.bugs.append(bug)
        record_activity(
            db,
            entity_type="Requirement",
            entity_id=requirement.id,
            action=f"linked bug {bug_id}",
            user_id=user_id,
            project_id=requirement.project_id,
        )


def unlink_requirement_bug(db: Session, requirement_id: int, bug_id: int, user_id: int | None = None) -> None:
    requirement = db.get(Requirement, requirement_id)
    if requirement is None:
        raise not_found("Requirement not found")
    bug = db.get(Bug, bug_id)
    if bug is None:
        raise not_found("Bug not found")
    if bug in requirement.bugs:
        requirement.bugs.remove(bug)
        record_activity(
            db,
            entity_type="Requirement",
            entity_id=requirement.id,
            action=f"unlinked bug {bug_id}",
            user_id=user_id,
            project_id=requirement.project_id,
        )

