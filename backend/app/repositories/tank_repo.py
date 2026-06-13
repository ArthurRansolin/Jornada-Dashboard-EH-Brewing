from sqlalchemy.orm import Session
from app.models.tank import Tank


def list_tanks(db: Session):
    return db.query(Tank).order_by(Tank.id).all()


def get_tank(db: Session, tank_id: int):
    return db.query(Tank).filter(Tank.id == tank_id).first()


def create_tank(db: Session, data: dict):
    obj = Tank(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_tank(db: Session, tank: Tank, data: dict):
    for key, value in data.items():
        setattr(tank, key, value)
    db.commit()
    db.refresh(tank)
    return tank


def delete_tank(db: Session, tank: Tank):
    db.delete(tank)
    db.commit()
