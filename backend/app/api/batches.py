from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.batch import Batch
from app.models.tank import Tank
from app.models.temperature_profile import TemperatureProfile
from app.schemas.batch import BatchCreate, BatchOut, BatchStart, BatchUpdate

router = APIRouter(prefix='/batches', tags=['batches'])


@router.get('', response_model=list[BatchOut])
def list_batches(db: Session = Depends(get_db)):
    return db.query(Batch).order_by(Batch.id.desc()).all()


@router.post('', response_model=BatchOut)
def create_batch(payload: BatchCreate, db: Session = Depends(get_db)):
    batch = Batch(**payload.model_dump(), status='draft')
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


@router.post('/start', response_model=BatchOut)
def start_batch(payload: BatchStart, db: Session = Depends(get_db)):
    tank = db.query(Tank).filter(Tank.id == payload.tank_id).first()
    if not tank:
        raise HTTPException(status_code=404, detail='Tank not found')

    profile = db.query(TemperatureProfile).filter(TemperatureProfile.id == payload.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail='Profile not found')

    active = (
        db.query(Batch)
        .filter(Batch.tank_id == payload.tank_id, Batch.status == 'running')
        .first()
    )
    if active:
        raise HTTPException(status_code=409, detail='Tank already has a running batch')

    batch = Batch(**payload.model_dump(), status='running', started_at=datetime.utcnow())
    db.add(batch)
    tank.status = 'fermentando'
    db.commit()
    db.refresh(batch)
    return batch


@router.post('/{batch_id}/finish', response_model=BatchOut)
def finish_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail='Batch not found')
    batch.status = 'finished'
    batch.ended_at = datetime.utcnow()
    tank = db.query(Tank).filter(Tank.id == batch.tank_id).first()
    if tank:
        tank.status = 'finalizado'
    db.commit()
    db.refresh(batch)
    return batch


@router.put('/{batch_id}', response_model=BatchOut)
def update_batch(batch_id: int, payload: BatchUpdate, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail='Batch not found')
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(batch, key, value)
    db.commit()
    db.refresh(batch)
    return batch
