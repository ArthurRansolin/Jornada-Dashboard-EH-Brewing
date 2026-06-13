import threading
import time
from datetime import datetime
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.batch import Batch
from app.models.command_log import CommandLog
from app.models.controller import Controller
from app.models.reading import Reading
from app.models.tank import Tank
from app.models.temperature_profile import TemperatureProfile
from app.services import n1050_registers as reg
from app.services.n1050_client import N1050Client
from app.services.profile_runner import get_profile_setpoint


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
                        sp_written = snapshot.get('sp_active')
                        if tank:
                            profile_sp = self._apply_running_profile(db, client, controller, tank)
                            if profile_sp is not None:
                                sp_written = profile_sp
                        reading = Reading(
                            controller_id=controller.id,
                            tank_id=tank.id if tank else None,
                            ts=datetime.utcnow(),
                            pv=snapshot.get('pv'),
                            sp_active=snapshot.get('sp_active'),
                            sp_written=sp_written,
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

    def _apply_running_profile(self, db, client: N1050Client, controller: Controller, tank: Tank):
        batch = (
            db.query(Batch)
            .filter(Batch.tank_id == tank.id, Batch.status == 'running', Batch.started_at.isnot(None), Batch.profile_id.isnot(None))
            .order_by(Batch.started_at.desc())
            .first()
        )
        if not batch:
            return None

        profile = db.query(TemperatureProfile).filter(TemperatureProfile.id == batch.profile_id).first()
        if not profile:
            return None

        segments = [
            {
                'segment_order': segment.segment_order,
                'target_sp': segment.target_sp,
                'duration_seconds': segment.duration_seconds,
            }
            for segment in profile.segments
        ]
        target_sp, segment_order = get_profile_setpoint(segments, batch.started_at)
        if target_sp is None:
            return None

        last_written = (
            db.query(Reading)
            .filter(Reading.tank_id == tank.id, Reading.sp_written.isnot(None))
            .order_by(Reading.ts.desc())
            .first()
        )
        if last_written and round(float(last_written.sp_written), 2) == round(float(target_sp), 2):
            return target_sp

        try:
            result = client.write_setpoint(controller.slave_id, int(round(target_sp)))
            success = not result.isError()
            response_text = str(result)
        except Exception as exc:
            success = False
            response_text = str(exc)

        db.add(CommandLog(
            controller_id=controller.id,
            tank_id=tank.id,
            command_type=f'profile_setpoint_s{segment_order}',
            register_address=reg.REG_SP_MAIN,
            value_sent=str(target_sp),
            success=success,
            response_text=response_text,
        ))
        return target_sp if success else None
