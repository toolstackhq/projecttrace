from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user, require_admin
from app.core.database import get_db
from app.models.entities import ActivityLog, Bug, Comment, Requirement
from app.models.entities import User
from app.schemas.common import Page
from app.schemas.entities import BugCreate, BugDetail, BugRead, BugUpdate
from app.services.activity import record_activity
from app.services.query import apply_search, not_found, paginate

router = APIRouter(prefix="/bugs", tags=["Bugs"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=BugRead, status_code=201)
def create_bug(
    payload: BugCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Bug:
    bug = Bug(**payload.model_dump(exclude={"reporter_id"}), reporter_id=current_user.id)
    db.add(bug)
    db.commit()
    db.refresh(bug)
    record_activity(db, entity_type="Bug", entity_id=bug.id, action="created", user_id=current_user.id, project_id=bug.project_id)
    db.commit()
    return bug


@router.get("", response_model=Page[BugRead])
def list_bugs(
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    project_id: int | None = None,
    status: str | None = None,
    severity: str | None = None,
    assignee_id: int | None = None,
    reporter_id: int | None = None,
    sort: str | None = "updated_at",
    order: str = "desc",
    db: Session = Depends(get_db),
):
    stmt = select(Bug).options(selectinload(Bug.project), selectinload(Bug.assignee), selectinload(Bug.reporter))
    stmt = apply_search(stmt, [Bug.title, Bug.description], search)
    if project_id is not None:
        stmt = stmt.where(Bug.project_id == project_id)
    if status is not None:
        stmt = stmt.where(Bug.status == status)
    if severity is not None:
        stmt = stmt.where(Bug.severity == severity)
    if assignee_id is not None:
        stmt = stmt.where(Bug.assignee_id == assignee_id)
    if reporter_id is not None:
        stmt = stmt.where(Bug.reporter_id == reporter_id)
    column = getattr(Bug, sort, None) if sort else None
    stmt = stmt.order_by(column.desc() if column is not None and order.lower() == "desc" else column.asc() if column is not None else Bug.updated_at.desc())
    return paginate(db, stmt, page=page, page_size=page_size)


@router.get("/{bug_id}", response_model=BugDetail)
def get_bug(bug_id: int, db: Session = Depends(get_db)) -> BugDetail:
    bug = (
        db.execute(
            select(Bug)
            .options(
                selectinload(Bug.project),
                selectinload(Bug.assignee),
                selectinload(Bug.reporter),
                selectinload(Bug.requirements).selectinload(Requirement.project),
                selectinload(Bug.requirements).selectinload(Requirement.feature),
                selectinload(Bug.requirements).selectinload(Requirement.creator),
                selectinload(Bug.comments).selectinload(Comment.user),
            )
            .where(Bug.id == bug_id)
        )
        .scalars()
        .first()
    )
    if bug is None:
        raise not_found("Bug not found")
    requirements = sorted(bug.requirements, key=lambda item: item.created_at, reverse=True)
    comments = sorted(bug.comments, key=lambda item: item.created_at, reverse=True)
    activity = (
        db.execute(
            select(ActivityLog)
            .options(selectinload(ActivityLog.user), selectinload(ActivityLog.project))
            .where(ActivityLog.entity_type == "Bug", ActivityLog.entity_id == bug_id)
            .order_by(ActivityLog.timestamp.desc())
            .limit(20)
        )
        .scalars()
        .all()
    )
    return BugDetail(**BugRead.model_validate(bug).model_dump(), requirements=requirements, comments=comments, activity=activity)


@router.put("/{bug_id}", response_model=BugRead)
def update_bug(
    bug_id: int,
    payload: BugUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Bug:
    bug = db.get(Bug, bug_id)
    if bug is None:
        raise not_found("Bug not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(bug, field, value)
    db.commit()
    db.refresh(bug)
    record_activity(db, entity_type="Bug", entity_id=bug.id, action="updated", user_id=current_user.id, project_id=bug.project_id)
    db.commit()
    return bug


@router.delete("/{bug_id}", status_code=204)
def delete_bug(bug_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> None:
    bug = db.get(Bug, bug_id)
    if bug is None:
        raise not_found("Bug not found")
    db.delete(bug)
    db.commit()
