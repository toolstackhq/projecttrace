from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user, require_admin
from app.core.database import get_db
from app.models.entities import ActivityLog, Bug, Epic, Feature, Project, Requirement, TestCase
from app.models.entities import User
from app.schemas.common import Page
from app.schemas.entities import ProjectCreate, ProjectDetail, ProjectRead, ProjectUpdate
from app.services.activity import record_activity
from app.services.query import apply_search, not_found, paginate

router = APIRouter(prefix="/projects", tags=["Projects"], dependencies=[Depends(get_current_user)])


def _base_stmt():
    return select(Project).options(selectinload(Project.owner))


@router.post("", response_model=ProjectRead, status_code=201)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Project:
    project = Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    record_activity(
        db,
        entity_type="Project",
        entity_id=project.id,
        action="created",
        user_id=current_user.id,
        project_id=project.id,
    )
    db.commit()
    return project


@router.get("", response_model=Page[ProjectRead])
def list_projects(
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    owner_id: int | None = None,
    sort: str | None = "updated_at",
    order: str = "desc",
    db: Session = Depends(get_db),
):
    stmt = _base_stmt()
    stmt = apply_search(stmt, [Project.name, Project.description], search)
    if owner_id is not None:
        stmt = stmt.where(Project.owner_id == owner_id)
    clause = getattr(Project, sort, None) if sort else None
    if clause is not None:
        stmt = stmt.order_by(clause.desc() if order.lower() == "desc" else clause.asc())
    else:
        stmt = stmt.order_by(Project.updated_at.desc())
    return paginate(db, stmt, page=page, page_size=page_size)


@router.get("/{project_id}", response_model=ProjectDetail)
def get_project(project_id: int, db: Session = Depends(get_db)) -> ProjectDetail:
    project = (
        db.execute(
            select(Project)
            .options(selectinload(Project.owner))
            .where(Project.id == project_id)
        )
        .scalars()
        .first()
    )
    if project is None:
        raise not_found("Project not found")
    epics = (
        db.execute(select(Epic).options(selectinload(Epic.project), selectinload(Epic.owner)).where(Epic.project_id == project_id).order_by(Epic.created_at.desc()))
        .scalars()
        .all()
    )
    features = (
        db.execute(select(Feature).options(selectinload(Feature.project), selectinload(Feature.epic), selectinload(Feature.owner)).where(Feature.project_id == project_id).order_by(Feature.created_at.desc()))
        .scalars()
        .all()
    )
    requirements = (
        db.execute(
            select(Requirement)
            .options(selectinload(Requirement.project), selectinload(Requirement.feature), selectinload(Requirement.creator))
            .where(Requirement.project_id == project_id)
            .order_by(Requirement.created_at.desc())
        )
        .scalars()
        .all()
    )
    test_cases = (
        db.execute(select(TestCase).options(selectinload(TestCase.project)).where(TestCase.project_id == project_id).order_by(TestCase.created_at.desc()))
        .scalars()
        .all()
    )
    bugs = (
        db.execute(
            select(Bug)
            .options(selectinload(Bug.project), selectinload(Bug.assignee), selectinload(Bug.reporter))
            .where(Bug.project_id == project_id)
            .order_by(Bug.created_at.desc())
        )
        .scalars()
        .all()
    )
    activity = (
        db.execute(
            select(ActivityLog)
            .options(selectinload(ActivityLog.user), selectinload(ActivityLog.project))
            .where(ActivityLog.project_id == project_id)
            .order_by(ActivityLog.timestamp.desc())
            .limit(20)
        )
        .scalars()
        .all()
    )
    return ProjectDetail(
        **ProjectRead.model_validate(project).model_dump(),
        epics=epics,
        features=features,
        requirements=requirements,
        test_cases=test_cases,
        bugs=bugs,
        activity=activity,
    )


@router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise not_found("Project not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    record_activity(
        db,
        entity_type="Project",
        entity_id=project.id,
        action="updated",
        user_id=current_user.id,
        project_id=project.id,
    )
    db.commit()
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> None:
    project = db.get(Project, project_id)
    if project is None:
        raise not_found("Project not found")
    db.delete(project)
    db.commit()
