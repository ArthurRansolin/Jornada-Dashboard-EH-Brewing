from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.reading_repo import latest_tank_reading
from app.repositories.tank_repo import create_tank, delete_tank, get_tank, list_tanks, update_tank
from app.schemas.reading import ReadingOut
from app.schemas.tank import TankCreate, TankOut, TankUpdate
from app.models.tank import Tank

router = APIRouter(prefix='/tanks', tags=['tanks'])


@router.get('', response_model=list[TankOut])
def get_all(db: Session = Depends(get_db)):
    return list_tanks(db)


@router.post('', response_model=TankOut)
def create(payload: TankCreate, db: Session = Depends(get_db)):
    if payload.controller_id is not None:
        existing = db.query(Tank).filter(Tank.controller_id == payload.controller_id).first()
        if existing:
            raise HTTPException(
                status_code=409,
                detail='Controller already linked to another tank',
            )
    return create_tank(db, payload.model_dump())


@router.get('/{tank_id}', response_model=TankOut)
def get_one(tank_id: int, db: Session = Depends(get_db)):
    tank = get_tank(db, tank_id)
    if not tank:
        raise HTTPException(status_code=404, detail='Tank not found')
    return tank


@router.put('/{tank_id}', response_model=TankOut)
def update(tank_id: int, payload: TankUpdate, db: Session = Depends(get_db)):
    tank = get_tank(db, tank_id)
    if not tank:
        raise HTTPException(status_code=404, detail='Tank not found')
    return update_tank(db, tank, payload.model_dump(exclude_none=True))


@router.delete('/{tank_id}')
def delete(tank_id: int, db: Session = Depends(get_db)):
    tank = get_tank(db, tank_id)
    if not tank:
        raise HTTPException(status_code=404, detail='Tank not found')
    delete_tank(db, tank)
    return {'success': True}


@router.get('/{tank_id}/latest-reading', response_model=ReadingOut | None)
def get_latest(tank_id: int, db: Session = Depends(get_db)):
    return latest_tank_reading(db, tank_id)
