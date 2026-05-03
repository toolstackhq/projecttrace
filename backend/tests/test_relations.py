from __future__ import annotations

from app.models.entities import ActivityLog, Bug, Epic, Feature, Project, Requirement, TestCase as TestCaseModel, User
from app.models.enums import BugSeverity, BugStatus, EpicStatus, FeatureStatus, Priority, RequirementStatus, UserRole
from app.services.relations import (
    link_requirement_bug,
    link_requirement_test_case,
    unlink_requirement_bug,
    unlink_requirement_test_case,
)

TestCaseModel.__test__ = False


def seed_graph(session):
    user = User(id=1, name="Owner", email="owner@example.com", role=UserRole.ADMIN.value, password_hash="hash")
    project = Project(id=10, name="Project A", description="Project", owner_id=1)
    epic = Epic(id=20, title="Epic A", description="Epic", project_id=10, status=EpicStatus.PLANNED.value, owner_id=1)
    feature = Feature(id=30, title="Feature A", description="Feature", epic_id=20, project_id=10, status=FeatureStatus.PLANNED.value, owner_id=1)
    requirement = Requirement(
        id=40,
        title="Requirement A",
        description="Requirement",
        feature_id=30,
        project_id=10,
        priority=Priority.MEDIUM.value,
        status=RequirementStatus.DRAFT.value,
        created_by=1,
    )
    test_case = TestCaseModel(id=50, title="Test Case A", description="Case", priority=Priority.MEDIUM.value, project_id=10)
    bug = Bug(
        id=60,
        title="Bug A",
        description="Bug",
        severity=BugSeverity.MEDIUM.value,
        status=BugStatus.OPEN.value,
        project_id=10,
        assignee_id=1,
        reporter_id=1,
    )
    session.add_all([user, project, epic, feature, requirement, test_case, bug])
    session.commit()
    return requirement, test_case, bug


def test_link_requirement_test_case_adds_association(db_session):
    requirement, test_case, _ = seed_graph(db_session)
    link_requirement_test_case(db_session, requirement.id, test_case.id, user_id=1)
    db_session.commit()
    db_session.refresh(requirement)
    assert [item.id for item in requirement.test_cases] == [test_case.id]
    assert db_session.query(ActivityLog).count() == 1


def test_link_requirement_test_case_does_not_duplicate(db_session):
    requirement, test_case, _ = seed_graph(db_session)
    link_requirement_test_case(db_session, requirement.id, test_case.id, user_id=1)
    link_requirement_test_case(db_session, requirement.id, test_case.id, user_id=1)
    db_session.commit()
    db_session.refresh(requirement)
    assert len(requirement.test_cases) == 1
    assert db_session.query(ActivityLog).count() == 1


def test_unlink_requirement_test_case_removes_association(db_session):
    requirement, test_case, _ = seed_graph(db_session)
    link_requirement_test_case(db_session, requirement.id, test_case.id, user_id=1)
    db_session.commit()
    unlink_requirement_test_case(db_session, requirement.id, test_case.id, user_id=1)
    db_session.commit()
    db_session.refresh(requirement)
    assert requirement.test_cases == []
    assert db_session.query(ActivityLog).count() == 2


def test_unlink_requirement_test_case_is_noop_when_missing_link(db_session):
    requirement, test_case, _ = seed_graph(db_session)
    unlink_requirement_test_case(db_session, requirement.id, test_case.id, user_id=1)
    db_session.commit()
    db_session.refresh(requirement)
    assert requirement.test_cases == []
    assert db_session.query(ActivityLog).count() == 0


def test_link_requirement_test_case_missing_requirement_raises(db_session):
    _, test_case, _ = seed_graph(db_session)
    try:
        link_requirement_test_case(db_session, 999, test_case.id, user_id=1)
    except Exception as exc:
        assert "Requirement not found" in str(exc)
    else:
        raise AssertionError("Expected exception")


def test_link_requirement_test_case_missing_test_case_raises(db_session):
    requirement, _, _ = seed_graph(db_session)
    try:
        link_requirement_test_case(db_session, requirement.id, 999, user_id=1)
    except Exception as exc:
        assert "Test case not found" in str(exc)
    else:
        raise AssertionError("Expected exception")


def test_unlink_requirement_test_case_missing_requirement_raises(db_session):
    _, test_case, _ = seed_graph(db_session)
    try:
        unlink_requirement_test_case(db_session, 999, test_case.id, user_id=1)
    except Exception as exc:
        assert "Requirement not found" in str(exc)
    else:
        raise AssertionError("Expected exception")


def test_unlink_requirement_test_case_missing_test_case_raises(db_session):
    requirement, _, _ = seed_graph(db_session)
    try:
        unlink_requirement_test_case(db_session, requirement.id, 999, user_id=1)
    except Exception as exc:
        assert "Test case not found" in str(exc)
    else:
        raise AssertionError("Expected exception")


def test_link_requirement_bug_adds_association(db_session):
    requirement, _, bug = seed_graph(db_session)
    link_requirement_bug(db_session, requirement.id, bug.id, user_id=1)
    db_session.commit()
    db_session.refresh(requirement)
    assert [item.id for item in requirement.bugs] == [bug.id]
    assert db_session.query(ActivityLog).count() == 1


def test_link_requirement_bug_does_not_duplicate(db_session):
    requirement, _, bug = seed_graph(db_session)
    link_requirement_bug(db_session, requirement.id, bug.id, user_id=1)
    link_requirement_bug(db_session, requirement.id, bug.id, user_id=1)
    db_session.commit()
    db_session.refresh(requirement)
    assert len(requirement.bugs) == 1
    assert db_session.query(ActivityLog).count() == 1


def test_unlink_requirement_bug_removes_association(db_session):
    requirement, _, bug = seed_graph(db_session)
    link_requirement_bug(db_session, requirement.id, bug.id, user_id=1)
    db_session.commit()
    unlink_requirement_bug(db_session, requirement.id, bug.id, user_id=1)
    db_session.commit()
    db_session.refresh(requirement)
    assert requirement.bugs == []
    assert db_session.query(ActivityLog).count() == 2


def test_unlink_requirement_bug_is_noop_when_missing_link(db_session):
    requirement, _, bug = seed_graph(db_session)
    unlink_requirement_bug(db_session, requirement.id, bug.id, user_id=1)
    db_session.commit()
    db_session.refresh(requirement)
    assert requirement.bugs == []
    assert db_session.query(ActivityLog).count() == 0


def test_link_requirement_bug_missing_bug_raises(db_session):
    requirement, _, _ = seed_graph(db_session)
    try:
        link_requirement_bug(db_session, requirement.id, 999, user_id=1)
    except Exception as exc:
        assert "Bug not found" in str(exc)
    else:
        raise AssertionError("Expected exception")
