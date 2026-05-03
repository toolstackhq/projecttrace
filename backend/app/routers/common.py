from collections.abc import Sequence
from typing import Any

from fastapi import Query
from sqlalchemy import Select, asc, desc


def pagination_params(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> tuple[int, int]:
    return page, page_size


def sort_clause(model: Any, sort: str | None, order: str) -> Any:
    if not sort:
        return None
    column = getattr(model, sort, None)
    if column is None:
        return None
    return desc(column) if order.lower() == "desc" else asc(column)


def apply_optional_order(stmt: Select, clause: Any, fallback: Any) -> Select:
    if clause is not None:
        return stmt.order_by(clause)
    return stmt.order_by(fallback)


def id_list(values: Sequence[Any] | None) -> list[Any]:
    return list(values) if values is not None else []

