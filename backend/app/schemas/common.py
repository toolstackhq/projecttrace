from collections.abc import Sequence
from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: Sequence[T]
    total: int
    page: int
    page_size: int
    pages: int


class CountBucket(ORMBase):
    label: str
    count: int


class SummaryResponse(ORMBase):
    totals: dict[str, int]
    bug_status: list[CountBucket]
    requirement_status: list[CountBucket]
    test_run_status: list[CountBucket]


class ActivitySnapshot(ORMBase):
    id: int
    entity_type: str
    entity_id: int
    action: str
    user_id: int | None
    project_id: int | None
    timestamp: datetime

