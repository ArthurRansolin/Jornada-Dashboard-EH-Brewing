from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.temperature_profile import TemperatureProfile
from app.models.temperature_profile_segment import TemperatureProfileSegment
from app.schemas.profile import TemperatureProfileCreate, TemperatureProfileOut, TemperatureProfileSegmentCreate

router = APIRouter(prefix='/profiles', tags=['profiles'])


@router.get('', response_model=list[TemperatureProfileOut])
def get_profiles(db: Session = Depends(get_db)):
    return db.query(TemperatureProfile).order_by(TemperatureProfile.id).all()


@router.post('', response_model=TemperatureProfileOut)
def create_profile(payload: TemperatureProfileCreate, db: Session = Depends(get_db)):
    obj = TemperatureProfile(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.post('/{profile_id}/segments')
def add_segment(profile_id: int, payload: TemperatureProfileSegmentCreate, db: Session = Depends(get_db)):
    obj = TemperatureProfileSegment(profile_id=profile_id, **payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
