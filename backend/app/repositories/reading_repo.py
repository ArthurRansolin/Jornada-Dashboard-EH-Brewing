from sqlalchemy.orm import Session
from app.models.reading import Reading


def create_reading(db: Session, data: dict):
    obj = Reading(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def latest_tank_reading(db: Session, tank_id: int):
    return db.query(Reading).filter(Reading.tank_id == tank_id).order_by(Reading.ts.desc()).first()


def list_readings(db: Session, tank_id: int | None = None, limit: int = 500):
    q = db.query(Reading)
    if tank_id is not None:
        q = q.filter(Reading.tank_id == tank_id)
    return q.order_by(Reading.ts.desc()).limit(limit).all()
