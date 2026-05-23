from sqlalchemy.orm import Session
from app.models.command_log import CommandLog


def create_command_log(db: Session, data: dict):
    obj = CommandLog(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def list_command_logs(db: Session, controller_id: int | None = None):
    q = db.query(CommandLog)
    if controller_id is not None:
        q = q.filter(CommandLog.controller_id == controller_id)
    return q.order_by(CommandLog.issued_at.desc()).limit(200).all()
