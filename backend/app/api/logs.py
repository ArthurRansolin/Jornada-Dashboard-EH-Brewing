from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.command_log_repo import list_command_logs
from app.schemas.logs import CommandLogOut

router = APIRouter(prefix='/logs', tags=['logs'])


@router.get('/commands', response_model=list[CommandLogOut])
def get_command_logs(
    controller_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_command_logs(db, controller_id=controller_id)
