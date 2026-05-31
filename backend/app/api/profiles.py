from fastapi import APIRouter, Depends
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.temperature_profile import TemperatureProfile
from app.models.temperature_profile_segment import TemperatureProfileSegment
from app.schemas.profile import TemperatureProfileCreate, TemperatureProfileOut, TemperatureProfileSegmentCreate

router = APIRouter(prefix='/profiles', tags=['profiles'])


@router.get('', response_model=list[TemperatureProfileOut])
def get_profiles(db: Session = Depends(get_db)):
    return (
        db.query(TemperatureProfile)
        .options(selectinload(TemperatureProfile.segments))
        .order_by(TemperatureProfile.id)
        .all()
    )


@router.post('', response_model=TemperatureProfileOut)
def create_profile(payload: TemperatureProfileCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    segments = data.pop('segments', [])
    obj = TemperatureProfile(**data)
    db.add(obj)
    db.flush()
    for index, segment in enumerate(segments, start=1):
        segment_data = dict(segment)
        segment_data.setdefault('segment_order', index)
        db.add(TemperatureProfileSegment(profile_id=obj.id, **segment_data))
    db.commit()
    db.refresh(obj)
    return obj


@router.post('/{profile_id}/segments', response_model=TemperatureProfileSegmentCreate)
def add_segment(profile_id: int, payload: TemperatureProfileSegmentCreate, db: Session = Depends(get_db)):
    obj = TemperatureProfileSegment(profile_id=profile_id, **payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
