from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.beer_type import BeerType
from app.schemas.beer_type import BeerTypeCreate, BeerTypeOut, BeerTypeUpdate

router = APIRouter(prefix='/beer-types', tags=['beer-types'])


@router.get('', response_model=list[BeerTypeOut])
def get_all(db: Session = Depends(get_db)):
    return db.query(BeerType).order_by(BeerType.name).all()


@router.post('', response_model=BeerTypeOut)
def create(payload: BeerTypeCreate, db: Session = Depends(get_db)):
    beer_type = BeerType(**payload.model_dump())
    db.add(beer_type)
    db.commit()
    db.refresh(beer_type)
    return beer_type


@router.put('/{beer_type_id}', response_model=BeerTypeOut)
def update(beer_type_id: int, payload: BeerTypeUpdate, db: Session = Depends(get_db)):
    beer_type = db.query(BeerType).filter(BeerType.id == beer_type_id).first()
    if not beer_type:
        raise HTTPException(status_code=404, detail='Beer type not found')

    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(beer_type, key, value)

    db.commit()
    db.refresh(beer_type)
    return beer_type


@router.delete('/{beer_type_id}')
def delete(beer_type_id: int, db: Session = Depends(get_db)):
    beer_type = db.query(BeerType).filter(BeerType.id == beer_type_id).first()
    if not beer_type:
        raise HTTPException(status_code=404, detail='Beer type not found')
    db.delete(beer_type)
    db.commit()
    return {'success': True}
