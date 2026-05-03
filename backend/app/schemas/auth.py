from pydantic import BaseModel, EmailStr, Field

from app.schemas.entities import UserRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class AuthStatus(BaseModel):
    bootstrap_required: bool
