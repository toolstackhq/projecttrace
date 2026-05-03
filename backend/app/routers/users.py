from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, get_optional_current_user
from app.core.database import get_db
from app.core.security import hash_password
from app.models.entities import User
from app.models.enums import UserRole
from app.schemas.common import Page
from app.schemas.entities import UserCreate, UserRead
from app.services.activity import record_activity
from app.services.query import apply_search, not_found, paginate

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("", response_model=UserRead, status_code=201)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> User:
    user_count = db.execute(select(func.count()).select_from(User)).scalar_one()
    is_bootstrap = user_count == 0
    if not is_bootstrap and (current_user is None or current_user.role != UserRole.ADMIN.value):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    role = UserRole.ADMIN.value if is_bootstrap else payload.role.value
    user = User(
        **payload.model_dump(exclude={"role", "password"}),
        role=role,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    record_activity(db, entity_type="User", entity_id=user.id, action="created", user_id=current_user.id if current_user else user.id)
    db.commit()
    return user


@router.get("", response_model=Page[UserRead])
def list_users(
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    sort: str | None = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    stmt = select(User)
    stmt = apply_search(stmt, [User.name, User.email], search)
    clause = getattr(User, sort, None) if sort else None
    if clause is not None:
        stmt = stmt.order_by(clause.desc() if order.lower() == "desc" else clause.asc())
    else:
        stmt = stmt.order_by(User.created_at.desc())
    return paginate(db, stmt, page=page, page_size=page_size)


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise not_found("User not found")
    return user
