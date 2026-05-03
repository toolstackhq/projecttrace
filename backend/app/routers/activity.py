from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.entities import ActivityLog
from app.schemas.common import Page
from app.schemas.entities import ActivityLogRead
from app.services.query import paginate

router = APIRouter(tags=["Activity"], dependencies=[Depends(get_current_user)])


@router.get("/activity", response_model=Page[ActivityLogRead])
def list_activity(
    page: int = 1,
    page_size: int = 20,
    project_id: int | None = None,
    entity_type: str | None = None,
    entity_id: int | None = None,
    action: str | None = None,
    user_id: int | None = None,
    db: Session = Depends(get_db),
):
    stmt = select(ActivityLog).options(selectinload(ActivityLog.user), selectinload(ActivityLog.project))
    if project_id is not None:
        stmt = stmt.where(ActivityLog.project_id == project_id)
    if entity_type is not None:
        stmt = stmt.where(ActivityLog.entity_type == entity_type)
    if entity_id is not None:
        stmt = stmt.where(ActivityLog.entity_id == entity_id)
    if action is not None:
        stmt = stmt.where(ActivityLog.action == action)
    if user_id is not None:
        stmt = stmt.where(ActivityLog.user_id == user_id)
    stmt = stmt.order_by(ActivityLog.timestamp.desc())
    return paginate(db, stmt, page=page, page_size=page_size)


@router.get("/projects/{project_id}/activity", response_model=Page[ActivityLogRead])
def list_project_activity(project_id: int, page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
    stmt = (
        select(ActivityLog)
        .options(selectinload(ActivityLog.user), selectinload(ActivityLog.project))
        .where(ActivityLog.project_id == project_id)
        .order_by(ActivityLog.timestamp.desc())
    )
    return paginate(db, stmt, page=page, page_size=page_size)
