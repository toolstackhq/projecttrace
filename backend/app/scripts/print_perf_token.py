from __future__ import annotations

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.core.config import get_settings
from app.models.entities import User


def main() -> None:
    settings = get_settings()
    db = SessionLocal()
    try:
        user = db.execute(select(User).where(User.email == settings.seed_user_email)).scalars().first()
        if user is None:
            raise RuntimeError(f"Perf user {settings.seed_user_email} does not exist")
        print(create_access_token({"sub": str(user.id), "role": user.role, "email": user.email}))
    finally:
        db.close()


if __name__ == "__main__":
    main()
