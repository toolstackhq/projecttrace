from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user, require_admin
from app.core.database import get_db
from app.models.entities import ActivityLog, Feature, Requirement
from app.models.entities import User
from app.schemas.common import Page
from app.schemas.entities import FeatureCreate, FeatureDetail, FeatureRead, FeatureUpdate
from app.services.activity import record_activity
from app.services.query import apply_search, not_found, paginate

router = APIRouter(prefix="/features", tags=["Features"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=FeatureRead, status_code=201)
def create_feature(payload: FeatureCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Feature:
    feature = Feature(**payload.model_dump())
    db.add(feature)
    db.commit()
    db.refresh(feature)
    record_activity(
        db,
        entity_type="Feature",
        entity_id=feature.id,
        action="created",
        user_id=current_user.id,
        project_id=feature.project_id,
    )
    db.commit()
    return feature


@router.get("", response_model=Page[FeatureRead])
def list_features(
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    project_id: int | None = None,
    epic_id: int | None = None,
    status: str | None = None,
    owner_id: int | None = None,
    sort: str | None = "updated_at",
    order: str = "desc",
    db: Session = Depends(get_db),
):
    stmt = select(Feature).options(selectinload(Feature.project), selectinload(Feature.epic), selectinload(Feature.owner))
    stmt = apply_search(stmt, [Feature.title, Feature.description], search)
    if project_id is not None:
        stmt = stmt.where(Feature.project_id == project_id)
    if epic_id is not None:
        stmt = stmt.where(Feature.epic_id == epic_id)
    if status is not None:
        stmt = stmt.where(Feature.status == status)
    if owner_id is not None:
        stmt = stmt.where(Feature.owner_id == owner_id)
    column = getattr(Feature, sort, None) if sort else None
    stmt = stmt.order_by(column.desc() if column is not None and order.lower() == "desc" else column.asc() if column is not None else Feature.updated_at.desc())
    return paginate(db, stmt, page=page, page_size=page_size)


@router.get("/{feature_id}", response_model=FeatureDetail)
def get_feature(feature_id: int, db: Session = Depends(get_db)) -> FeatureDetail:
    feature = (
        db.execute(
            select(Feature)
            .options(selectinload(Feature.project), selectinload(Feature.epic), selectinload(Feature.owner))
            .where(Feature.id == feature_id)
        )
        .scalars()
        .first()
    )
    if feature is None:
        raise not_found("Feature not found")
    requirements = (
        db.execute(
            select(Requirement)
            .options(selectinload(Requirement.project), selectinload(Requirement.feature), selectinload(Requirement.creator))
            .where(Requirement.feature_id == feature_id)
            .order_by(Requirement.created_at.desc())
        )
        .scalars()
        .all()
    )
    activity = (
        db.execute(
            select(ActivityLog)
            .options(selectinload(ActivityLog.user), selectinload(ActivityLog.project))
            .where(ActivityLog.entity_type == "Feature", ActivityLog.entity_id == feature_id)
            .order_by(ActivityLog.timestamp.desc())
            .limit(20)
        )
        .scalars()
        .all()
    )
    return FeatureDetail(**FeatureRead.model_validate(feature).model_dump(), requirements=requirements, activity=activity)


@router.put("/{feature_id}", response_model=FeatureRead)
def update_feature(
    feature_id: int,
    payload: FeatureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Feature:
    feature = db.get(Feature, feature_id)
    if feature is None:
        raise not_found("Feature not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(feature, field, value)
    db.commit()
    db.refresh(feature)
    record_activity(
        db,
        entity_type="Feature",
        entity_id=feature.id,
        action="updated",
        user_id=current_user.id,
        project_id=feature.project_id,
    )
    db.commit()
    return feature


@router.delete("/{feature_id}", status_code=204)
def delete_feature(feature_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> None:
    feature = db.get(Feature, feature_id)
    if feature is None:
        raise not_found("Feature not found")
    db.delete(feature)
    db.commit()
