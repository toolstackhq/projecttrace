from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.dialects.postgresql import BIGINT

from app.core.database import Base


requirements_test_cases = Table(
    "requirements_test_cases",
    Base.metadata,
    Column("requirement_id", BIGINT, ForeignKey("requirements.id", ondelete="CASCADE"), primary_key=True),
    Column("test_case_id", BIGINT, ForeignKey("test_cases.id", ondelete="CASCADE"), primary_key=True),
)

requirements_bugs = Table(
    "requirements_bugs",
    Base.metadata,
    Column("requirement_id", BIGINT, ForeignKey("requirements.id", ondelete="CASCADE"), primary_key=True),
    Column("bug_id", BIGINT, ForeignKey("bugs.id", ondelete="CASCADE"), primary_key=True),
)

