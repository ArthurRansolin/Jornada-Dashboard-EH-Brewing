import threading
import time
from datetime import datetime
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.controller import Controller
from app.models.reading import Reading
from app.models.tank import Tank
from app.services.n1050_client import N1050Client


class PollingWorker:
    def __init__(self):
        self.running = False
        self.thread = None

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=2)

    def _run_loop(self):
        while self.running:
            db = SessionLocal()
            client = N1050Client()
            try:
                controllers = db.query(Controller).filter(Controller.enabled == True).all()
                if controllers:
                    client.connect()

                for controller in controllers:
                    try:
                        snapshot = client.read_process_data(controller.slave_id)
                        tank = db.query(Tank).filter(Tank.controller_id == controller.id).first()
                        reading = Reading(
                            controller_id=controller.id,
                            tank_id=tank.id if tank else None,
                            ts=datetime.utcnow(),
                            pv=snapshot.get('pv'),
                            sp_active=snapshot.get('sp_active'),
                            sp_written=snapshot.get('sp_active'),
                            mv=snapshot.get('mv'),
                            run_state=snapshot.get('run_state'),
                            control_mode=snapshot.get('control_mode'),
                            segment_number=snapshot.get('segment_number'),
                            segment_time_remaining=snapshot.get('segment_time_remaining'),
                            status_word_1=snapshot.get('status_word_1'),
                            status_word_2=snapshot.get('status_word_2'),
                            status_word_3=snapshot.get('status_word_3'),
                            source='hardware' if settings.MODBUS_ENABLED else 'simulator',
                        )
                        db.add(reading)
                        controller.last_seen_at = datetime.utcnow()
                    except Exception as exc:
                        print(f'[polling] erro no controller {controller.id}: {exc}')
                        continue

                db.commit()
            finally:
                client.close()
                db.close()

            time.sleep(settings.POLL_INTERVAL_SECONDS)
