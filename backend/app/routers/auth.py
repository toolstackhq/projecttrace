from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.models.entities import User
from app.schemas.auth import AuthStatus, LoginRequest, TokenResponse
from app.schemas.entities import UserRead

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/status", response_model=AuthStatus)
def bootstrap_status(db: Session = Depends(get_db)) -> AuthStatus:
    bootstrap_required = db.execute(select(func.count()).select_from(User)).scalar_one() == 0
    return AuthStatus(bootstrap_required=bootstrap_required)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.execute(select(User).where(User.email == payload.email)).scalars().first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(access_token=token, user=UserRead.model_validate(user))


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
