from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user, require_admin
from app.core.database import get_db
from app.models.entities import ActivityLog, Epic, Feature
from app.models.entities import User
from app.schemas.common import Page
from app.schemas.entities import EpicCreate, EpicDetail, EpicRead, EpicUpdate
from app.services.activity import record_activity
from app.services.query import apply_search, not_found, paginate

router = APIRouter(prefix="/epics", tags=["Epics"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=EpicRead, status_code=201)
def create_epic(payload: EpicCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Epic:
    epic = Epic(**payload.model_dump())
    db.add(epic)
    db.commit()
    db.refresh(epic)
    record_activity(db, entity_type="Epic", entity_id=epic.id, action="created", user_id=current_user.id, project_id=epic.project_id)
    db.commit()
    return epic


@router.get("", response_model=Page[EpicRead])
def list_epics(
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    project_id: int | None = None,
    status: str | None = None,
    owner_id: int | None = None,
    sort: str | None = "updated_at",
    order: str = "desc",
    db: Session = Depends(get_db),
):
    stmt = select(Epic).options(selectinload(Epic.project), selectinload(Epic.owner))
    stmt = apply_search(stmt, [Epic.title, Epic.description], search)
    if project_id is not None:
        stmt = stmt.where(Epic.project_id == project_id)
    if status is not None:
        stmt = stmt.where(Epic.status == status)
    if owner_id is not None:
        stmt = stmt.where(Epic.owner_id == owner_id)
    column = getattr(Epic, sort, None) if sort else None
    stmt = stmt.order_by(column.desc() if column is not None and order.lower() == "desc" else column.asc() if column is not None else Epic.updated_at.desc())
    return paginate(db, stmt, page=page, page_size=page_size)


@router.get("/{epic_id}", response_model=EpicDetail)
def get_epic(epic_id: int, db: Session = Depends(get_db)) -> EpicDetail:
    epic = (
        db.execute(
            select(Epic).options(selectinload(Epic.project), selectinload(Epic.owner)).where(Epic.id == epic_id)
        )
        .scalars()
        .first()
    )
    if epic is None:
        raise not_found("Epic not found")
    features = (
        db.execute(
            select(Feature)
            .options(selectinload(Feature.project), selectinload(Feature.epic), selectinload(Feature.owner))
            .where(Feature.epic_id == epic_id)
            .order_by(Feature.created_at.desc())
        )
        .scalars()
        .all()
    )
    activity = (
        db.execute(
            select(ActivityLog)
            .options(selectinload(ActivityLog.user), selectinload(ActivityLog.project))
            .where(ActivityLog.entity_type == "Epic", ActivityLog.entity_id == epic_id)
            .order_by(ActivityLog.timestamp.desc())
            .limit(20)
        )
        .scalars()
        .all()
    )
    return EpicDetail(**EpicRead.model_validate(epic).model_dump(), features=features, activity=activity)


@router.put("/{epic_id}", response_model=EpicRead)
def update_epic(
    epic_id: int,
    payload: EpicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Epic:
    epic = db.get(Epic, epic_id)
    if epic is None:
        raise not_found("Epic not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(epic, field, value)
    db.commit()
    db.refresh(epic)
    record_activity(db, entity_type="Epic", entity_id=epic.id, action="updated", user_id=current_user.id, project_id=epic.project_id)
    db.commit()
    return epic


@router.delete("/{epic_id}", status_code=204)
def delete_epic(epic_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> None:
    epic = db.get(Epic, epic_id)
    if epic is None:
        raise not_found("Epic not found")
    db.delete(epic)
    db.commit()
