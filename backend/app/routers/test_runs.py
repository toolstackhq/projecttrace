from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.entities import TestRun
from app.models.entities import User
from app.schemas.common import Page
from app.schemas.entities import TestRunCreate, TestRunRead, TestRunUpdate
from app.services.activity import record_activity
from app.services.query import not_found, paginate

router = APIRouter(prefix="/test-runs", tags=["Test Runs"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=TestRunRead, status_code=201)
def create_test_run(
    payload: TestRunCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TestRun:
    test_run = TestRun(**payload.model_dump(exclude={"executed_by"}), executed_by=current_user.id)
    db.add(test_run)
    db.commit()
    db.refresh(test_run)
    record_activity(db, entity_type="TestRun", entity_id=test_run.id, action="created", user_id=current_user.id, project_id=test_run.project_id)
    db.commit()
    return test_run


@router.get("", response_model=Page[TestRunRead])
def list_test_runs(
    page: int = 1,
    page_size: int = 20,
    project_id: int | None = None,
    status: str | None = None,
    executed_by: int | None = None,
    sort: str | None = "executed_at",
    order: str = "desc",
    db: Session = Depends(get_db),
):
    stmt = select(TestRun).options(selectinload(TestRun.project), selectinload(TestRun.test_case), selectinload(TestRun.executed_by_user))
    if project_id is not None:
        stmt = stmt.where(TestRun.project_id == project_id)
    if status is not None:
        stmt = stmt.where(TestRun.status == status)
    if executed_by is not None:
        stmt = stmt.where(TestRun.executed_by == executed_by)
    column = getattr(TestRun, sort, None) if sort else None
    stmt = stmt.order_by(column.desc() if column is not None and order.lower() == "desc" else column.asc() if column is not None else TestRun.executed_at.desc())
    return paginate(db, stmt, page=page, page_size=page_size)


@router.get("/{test_run_id}", response_model=TestRunRead)
def get_test_run(test_run_id: int, db: Session = Depends(get_db)) -> TestRun:
    test_run = (
        db.execute(select(TestRun).options(selectinload(TestRun.project), selectinload(TestRun.test_case), selectinload(TestRun.executed_by_user)).where(TestRun.id == test_run_id))
        .scalars()
        .first()
    )
    if test_run is None:
        raise not_found("Test run not found")
    return test_run


@router.put("/{test_run_id}", response_model=TestRunRead)
def update_test_run(
    test_run_id: int,
    payload: TestRunUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TestRun:
    test_run = db.get(TestRun, test_run_id)
    if test_run is None:
        raise not_found("Test run not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(test_run, field, value)
    db.commit()
    db.refresh(test_run)
    record_activity(db, entity_type="TestRun", entity_id=test_run.id, action="updated", user_id=current_user.id, project_id=test_run.project_id)
    db.commit()
    return test_run
