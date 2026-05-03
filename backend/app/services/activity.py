from sqlalchemy.orm import Session

from app.models.entities import ActivityLog


def record_activity(
    db: Session,
    *,
    entity_type: str,
    entity_id: int,
    action: str,
    user_id: int | None = None,
    project_id: int | None = None,
) -> ActivityLog:
    entry = ActivityLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        user_id=user_id,
        project_id=project_id,
    )
    db.add(entry)
    return entry

