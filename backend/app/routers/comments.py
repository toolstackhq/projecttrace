from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user, require_admin
from app.core.database import get_db
from app.models.entities import Comment
from app.models.entities import User
from app.schemas.entities import CommentCreate, CommentRead
from app.services.activity import record_activity
from app.services.query import not_found

router = APIRouter(tags=["Comments"], dependencies=[Depends(get_current_user)])


@router.post("/bugs/{bug_id}/comments", response_model=CommentRead, status_code=201)
def create_comment(
    bug_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Comment:
    if payload.bug_id != bug_id:
        payload = payload.model_copy(update={"bug_id": bug_id})
    comment = Comment(**payload.model_dump(exclude={"user_id"}), user_id=current_user.id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    record_activity(
        db,
        entity_type="Comment",
        entity_id=comment.id,
        action="created",
        user_id=current_user.id,
        project_id=comment.bug.project_id if comment.bug else None,
    )
    db.commit()
    return comment


@router.get("/bugs/{bug_id}/comments", response_model=list[CommentRead])
def list_comments(bug_id: int, db: Session = Depends(get_db)) -> list[Comment]:
    comments = (
        db.execute(select(Comment).options(selectinload(Comment.user)).where(Comment.bug_id == bug_id).order_by(Comment.created_at.desc()))
        .scalars()
        .all()
    )
    return comments


@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(comment_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> None:
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise not_found("Comment not found")
    db.delete(comment)
    db.commit()
