from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user, require_admin
from app.core.database import get_db
from app.models.entities import ActivityLog, Bug, Requirement, TestCase
from app.models.entities import User
from app.schemas.common import Page
from app.schemas.entities import RequirementCreate, RequirementDetail, RequirementRead, RequirementUpdate
from app.services.activity import record_activity
from app.services.query import apply_search, not_found, paginate
from app.services.relations import (
    link_requirement_bug,
    link_requirement_test_case,
    unlink_requirement_bug,
    unlink_requirement_test_case,
)

router = APIRouter(prefix="/requirements", tags=["Requirements"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=RequirementRead, status_code=201)
def create_requirement(
    payload: RequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Requirement:
    requirement = Requirement(**payload.model_dump(exclude={"created_by"}), created_by=current_user.id)
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    record_activity(
        db,
        entity_type="Requirement",
        entity_id=requirement.id,
        action="created",
        user_id=current_user.id,
        project_id=requirement.project_id,
    )
    db.commit()
    return requirement


@router.get("", response_model=Page[RequirementRead])
def list_requirements(
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    project_id: int | None = None,
    feature_id: int | None = None,
    status: str | None = None,
    priority: str | None = None,
    sort: str | None = "updated_at",
    order: str = "desc",
    db: Session = Depends(get_db),
):
    stmt = select(Requirement).options(
        selectinload(Requirement.project),
        selectinload(Requirement.feature),
        selectinload(Requirement.creator),
    )
    stmt = apply_search(stmt, [Requirement.title, Requirement.description], search)
    if project_id is not None:
        stmt = stmt.where(Requirement.project_id == project_id)
    if feature_id is not None:
        stmt = stmt.where(Requirement.feature_id == feature_id)
    if status is not None:
        stmt = stmt.where(Requirement.status == status)
    if priority is not None:
        stmt = stmt.where(Requirement.priority == priority)
    column = getattr(Requirement, sort, None) if sort else None
    stmt = stmt.order_by(column.desc() if column is not None and order.lower() == "desc" else column.asc() if column is not None else Requirement.updated_at.desc())
    return paginate(db, stmt, page=page, page_size=page_size)


@router.get("/{requirement_id}", response_model=RequirementDetail)
def get_requirement(requirement_id: int, db: Session = Depends(get_db)) -> RequirementDetail:
    requirement = (
        db.execute(
            select(Requirement)
            .options(
                selectinload(Requirement.project),
                selectinload(Requirement.feature),
                selectinload(Requirement.creator),
                selectinload(Requirement.test_cases).selectinload(TestCase.project),
                selectinload(Requirement.bugs).selectinload(Bug.project),
                selectinload(Requirement.bugs).selectinload(Bug.assignee),
                selectinload(Requirement.bugs).selectinload(Bug.reporter),
            )
            .where(Requirement.id == requirement_id)
        )
        .scalars()
        .first()
    )
    if requirement is None:
        raise not_found("Requirement not found")
    test_cases = sorted(requirement.test_cases, key=lambda item: item.created_at, reverse=True)
    bugs = sorted(requirement.bugs, key=lambda item: item.created_at, reverse=True)
    activity = (
        db.execute(
            select(ActivityLog)
            .options(selectinload(ActivityLog.user), selectinload(ActivityLog.project))
            .where(ActivityLog.entity_type == "Requirement", ActivityLog.entity_id == requirement_id)
            .order_by(ActivityLog.timestamp.desc())
            .limit(20)
        )
        .scalars()
        .all()
    )
    return RequirementDetail(
        **RequirementRead.model_validate(requirement).model_dump(),
        test_cases=test_cases,
        bugs=bugs,
        activity=activity,
    )


@router.put("/{requirement_id}", response_model=RequirementRead)
def update_requirement(
    requirement_id: int,
    payload: RequirementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Requirement:
    requirement = db.get(Requirement, requirement_id)
    if requirement is None:
        raise not_found("Requirement not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(requirement, field, value)
    db.commit()
    db.refresh(requirement)
    record_activity(
        db,
        entity_type="Requirement",
        entity_id=requirement.id,
        action="updated",
        user_id=current_user.id,
        project_id=requirement.project_id,
    )
    db.commit()
    return requirement


@router.delete("/{requirement_id}", status_code=204)
def delete_requirement(requirement_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> None:
    requirement = db.get(Requirement, requirement_id)
    if requirement is None:
        raise not_found("Requirement not found")
    db.delete(requirement)
    db.commit()


@router.post("/{requirement_id}/test-cases/{test_case_id}", status_code=204)
def add_requirement_test_case(
    requirement_id: int,
    test_case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    link_requirement_test_case(db, requirement_id, test_case_id, user_id=current_user.id)
    db.commit()


@router.delete("/{requirement_id}/test-cases/{test_case_id}", status_code=204)
def remove_requirement_test_case(
    requirement_id: int,
    test_case_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    unlink_requirement_test_case(db, requirement_id, test_case_id)
    db.commit()


@router.post("/{requirement_id}/bugs/{bug_id}", status_code=204)
def add_requirement_bug(
    requirement_id: int,
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    link_requirement_bug(db, requirement_id, bug_id, user_id=current_user.id)
    db.commit()


@router.delete("/{requirement_id}/bugs/{bug_id}", status_code=204)
def remove_requirement_bug(
    requirement_id: int,
    bug_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    unlink_requirement_bug(db, requirement_id, bug_id)
    db.commit()
