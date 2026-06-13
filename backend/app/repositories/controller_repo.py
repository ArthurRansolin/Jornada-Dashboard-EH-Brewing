from sqlalchemy.orm import Session
from app.models.controller import Controller


def list_controllers(db: Session):
    return db.query(Controller).order_by(Controller.id).all()


def get_controller(db: Session, controller_id: int):
    return db.query(Controller).filter(Controller.id == controller_id).first()


def create_controller(db: Session, data: dict):
    obj = Controller(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_controller(db: Session, controller: Controller, data: dict):
    for key, value in data.items():
        setattr(controller, key, value)
    db.commit()
    db.refresh(controller)
    return controller


def delete_controller(db: Session, controller: Controller):
    db.delete(controller)
    db.commit()
