from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.reading_repo import list_readings
from app.schemas.reading import ReadingOut

router = APIRouter(prefix='/readings', tags=['readings'])


@router.get('', response_model=list[ReadingOut])
def get_all(
    tank_id: int | None = Query(default=None),
    limit: int = Query(default=200, le=2000),
    db: Session = Depends(get_db),
):
    return list_readings(db, tank_id=tank_id, limit=limit)
