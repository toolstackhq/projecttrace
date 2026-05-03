from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.entities import Bug, Requirement, TestCase, TestRun, Project
from app.models.enums import BugStatus, RequirementStatus, TestRunStatus
from app.schemas.common import CountBucket, SummaryResponse

router = APIRouter(prefix="/stats", tags=["Stats"], dependencies=[Depends(get_current_user)])


@router.get("/summary", response_model=SummaryResponse)
def summary(db: Session = Depends(get_db)) -> SummaryResponse:
    totals = {
        "projects": db.execute(select(func.count()).select_from(Project)).scalar_one(),
        "requirements": db.execute(select(func.count()).select_from(Requirement)).scalar_one(),
        "test_cases": db.execute(select(func.count()).select_from(TestCase)).scalar_one(),
        "bugs": db.execute(select(func.count()).select_from(Bug)).scalar_one(),
        "open_bugs": db.execute(select(func.count()).select_from(Bug).where(Bug.status == BugStatus.OPEN.value)).scalar_one(),
        "failed_test_runs": db.execute(select(func.count()).select_from(TestRun).where(TestRun.status == TestRunStatus.FAILED.value)).scalar_one(),
    }
    bug_status = [
        CountBucket(label=label, count=count)
        for label, count in db.execute(select(Bug.status, func.count()).group_by(Bug.status).order_by(Bug.status)).all()
    ]
    requirement_status = [
        CountBucket(label=label, count=count)
        for label, count in db.execute(select(Requirement.status, func.count()).group_by(Requirement.status).order_by(Requirement.status)).all()
    ]
    test_run_status = [
        CountBucket(label=label, count=count)
        for label, count in db.execute(select(TestRun.status, func.count()).group_by(TestRun.status).order_by(TestRun.status)).all()
    ]
    return SummaryResponse(totals=totals, bug_status=bug_status, requirement_status=requirement_status, test_run_status=test_run_status)
