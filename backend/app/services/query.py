from collections.abc import Sequence

from fastapi import HTTPException
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.schemas.common import Page


def apply_pagination(
    stmt: Select,
    *,
    page: int,
    page_size: int,
) -> tuple[Select, int, int]:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    offset = (page - 1) * page_size
    return stmt.offset(offset).limit(page_size), page, page_size


def paginate(session: Session, stmt: Select, *, page: int, page_size: int) -> Page:
    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = session.execute(count_stmt).scalar_one()
    stmt, page, page_size = apply_pagination(stmt, page=page, page_size=page_size)
    items = session.execute(stmt).scalars().all()
    pages = max((total + page_size - 1) // page_size, 1) if total else 0
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


def apply_search(stmt: Select, fields: Sequence, term: str | None) -> Select:
    if not term:
        return stmt
    pattern = f"%{term.strip()}%"
    conditions = [field.ilike(pattern) for field in fields]
    return stmt.where(or_(*conditions))


def apply_in_filter(stmt: Select, field, values: Sequence[str] | None) -> Select:
    if values is None:
        return stmt
    if not values:
        return stmt.where(False)
    return stmt.where(field.in_(values))


def not_found(message: str) -> HTTPException:
    return HTTPException(status_code=404, detail=message)

