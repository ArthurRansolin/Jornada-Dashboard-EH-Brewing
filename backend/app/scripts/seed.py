from app.core.database import SessionLocal
from app.models.controller import Controller
from app.models.tank import Tank


def run():
    db = SessionLocal()
    try:
        controller = db.query(Controller).filter(Controller.slave_id == 1).first()
        if not controller:
            controller = Controller(
                name='N1050 Fermentador 01',
                model='N1050',
                slave_id=1,
                serial_port='SIMULATOR',
                baud_rate=9600,
                parity='N',
                data_bits=8,
                stop_bits=1,
                enabled=True,
            )
            db.add(controller)
            db.commit()
            db.refresh(controller)

        tank = db.query(Tank).filter(Tank.name == 'Fermentador 01').first()
        if not tank:
            tank = Tank(
                name='Fermentador 01',
                capacity_l=1000,
                location='Sala fria 01',
                status='fermentando',
                notes='Criado por seed inicial',
                ideal_temp_c=18,
                controller_id=controller.id,
            )
            db.add(tank)
            db.commit()
    finally:
        db.close()


if __name__ == '__main__':
    run()
