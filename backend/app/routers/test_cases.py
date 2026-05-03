from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user, require_admin
from app.core.database import get_db
from app.models.entities import Requirement, TestCase, TestRun
from app.models.entities import User
from app.schemas.common import Page
from app.schemas.entities import TestCaseCreate, TestCaseDetail, TestCaseRead, TestCaseUpdate
from app.services.activity import record_activity
from app.services.query import apply_search, not_found, paginate

router = APIRouter(prefix="/test-cases", tags=["Test Cases"], dependencies=[Depends(get_current_user)])


def _sync_automation_linked_at(test_case: TestCase, previous_name: str | None) -> None:
    current_name = (test_case.automated_test_name or "").strip()
    previous_name = (previous_name or "").strip()
    if current_name and current_name != previous_name:
        test_case.automation_linked_at = datetime.now(timezone.utc)
    elif not current_name:
        test_case.automation_linked_at = None


@router.post("", response_model=TestCaseRead, status_code=201)
def create_test_case(
    payload: TestCaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TestCase:
    test_case = TestCase(**payload.model_dump())
    _sync_automation_linked_at(test_case, previous_name=None)
    db.add(test_case)
    db.commit()
    db.refresh(test_case)
    record_activity(db, entity_type="TestCase", entity_id=test_case.id, action="created", user_id=current_user.id, project_id=test_case.project_id)
    db.commit()
    return test_case


@router.get("", response_model=Page[TestCaseRead])
def list_test_cases(
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    project_id: int | None = None,
    priority: str | None = None,
    automation_status: str | None = None,
    sort: str | None = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db),
):
    stmt = select(TestCase).options(selectinload(TestCase.project))
    stmt = apply_search(stmt, [TestCase.title, TestCase.description], search)
    if project_id is not None:
        stmt = stmt.where(TestCase.project_id == project_id)
    if priority is not None:
        stmt = stmt.where(TestCase.priority == priority)
    if automation_status is not None:
        stmt = stmt.where(TestCase.automation_status == automation_status)
    column = getattr(TestCase, sort, None) if sort else None
    stmt = stmt.order_by(column.desc() if column is not None and order.lower() == "desc" else column.asc() if column is not None else TestCase.created_at.desc())
    return paginate(db, stmt, page=page, page_size=page_size)


@router.get("/{test_case_id}", response_model=TestCaseDetail)
def get_test_case(test_case_id: int, db: Session = Depends(get_db)) -> TestCaseDetail:
    test_case = (
        db.execute(
            select(TestCase)
            .options(
                selectinload(TestCase.project),
                selectinload(TestCase.requirements).selectinload(Requirement.project),
                selectinload(TestCase.requirements).selectinload(Requirement.feature),
                selectinload(TestCase.requirements).selectinload(Requirement.creator),
                selectinload(TestCase.test_runs).selectinload(TestRun.project),
                selectinload(TestCase.test_runs).selectinload(TestRun.executed_by_user),
            )
            .where(TestCase.id == test_case_id)
        )
        .scalars()
        .first()
    )
    if test_case is None:
        raise not_found("Test case not found")
    requirements = sorted(test_case.requirements, key=lambda item: item.created_at, reverse=True)
    test_runs = sorted(test_case.test_runs, key=lambda item: item.executed_at, reverse=True)
    return TestCaseDetail(**TestCaseRead.model_validate(test_case).model_dump(), requirements=requirements, test_runs=test_runs)


@router.put("/{test_case_id}", response_model=TestCaseRead)
def update_test_case(
    test_case_id: int,
    payload: TestCaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TestCase:
    test_case = db.get(TestCase, test_case_id)
    if test_case is None:
        raise not_found("Test case not found")
    previous_name = test_case.automated_test_name
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(test_case, field, value)
    _sync_automation_linked_at(test_case, previous_name=previous_name)
    db.commit()
    db.refresh(test_case)
    record_activity(db, entity_type="TestCase", entity_id=test_case.id, action="updated", user_id=current_user.id, project_id=test_case.project_id)
    db.commit()
    return test_case


@router.delete("/{test_case_id}", status_code=204)
def delete_test_case(test_case_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> None:
    test_case = db.get(TestCase, test_case_id)
    if test_case is None:
        raise not_found("Test case not found")
    db.delete(test_case)
    db.commit()
