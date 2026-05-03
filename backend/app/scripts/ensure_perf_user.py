from __future__ import annotations

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.core.config import get_settings
from app.models.entities import User
from app.models.enums import UserRole


def main() -> None:
    settings = get_settings()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.seed_user_email).one_or_none()
        if user is None:
            user = User(
                name="ProjectTrace Admin",
                email=settings.seed_user_email,
                role=UserRole.ADMIN.value,
                password_hash=hash_password(settings.seed_user_password),
            )
            db.add(user)
        else:
            user.name = user.name or "ProjectTrace Admin"
            user.role = UserRole.ADMIN.value
            user.password_hash = hash_password(settings.seed_user_password)
        db.commit()
        print(f"Ensured perf login user {settings.seed_user_email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
