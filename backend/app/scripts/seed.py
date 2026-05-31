from datetime import datetime, timedelta
import math
from sqlalchemy import inspect, text
from app.core.database import Base, SessionLocal, engine
from app.models.batch import Batch
from app.models.beer_type import BeerType
from app.models.command_log import CommandLog
from app.models.controller import Controller
from app.models.reading import Reading
from app.models.tank import Tank
from app.models.temperature_profile import TemperatureProfile
from app.models.temperature_profile_segment import TemperatureProfileSegment
from app.services import n1050_registers as reg


def ensure_schema():
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name != 'sqlite':
        return
    inspector = inspect(engine)
    if 'beer_types' not in inspector.get_table_names():
        return
    columns = {column['name'] for column in inspector.get_columns('beer_types')}
    if 'default_profile_id' not in columns:
        with engine.begin() as connection:
            connection.execute(text('ALTER TABLE beer_types ADD COLUMN default_profile_id INTEGER'))


def get_or_create_controller(db, slave_id, name):
    controller = db.query(Controller).filter(Controller.slave_id == slave_id).first()
    if controller:
        return controller
    controller = Controller(
        name=name,
        model='N1050',
        slave_id=slave_id,
        serial_port='SIMULATOR',
        baud_rate=9600,
        parity='N',
        data_bits=8,
        stop_bits=1,
        enabled=True,
    )
    db.add(controller)
    db.flush()
    return controller


def get_or_create_tank(db, name, controller, ideal_temp):
    tank = db.query(Tank).filter(Tank.name == name).first()
    if tank:
        return tank
    tank = Tank(
        name=name,
        capacity_l=500,
        location='Sala fria demo',
        status='finalizado',
        notes='Tanque criado pelo seed de demonstracao',
        ideal_temp_c=ideal_temp,
        controller_id=controller.id,
    )
    db.add(tank)
    db.flush()
    return tank


def get_or_create_profile(db, name, description, segments):
    profile = db.query(TemperatureProfile).filter(TemperatureProfile.name == name).first()
    if profile:
        return profile
    profile = TemperatureProfile(
        name=name,
        description=description,
        mode='server_managed',
        time_base='HH:MM',
    )
    db.add(profile)
    db.flush()
    for order, target_sp, hours in segments:
        db.add(TemperatureProfileSegment(
            profile_id=profile.id,
            segment_order=order,
            target_sp=target_sp,
            duration_seconds=int(hours * 3600),
        ))
    db.flush()
    return profile


def get_or_create_beer_type(db, name, profile, temp_min, temp_max, description):
    beer_type = db.query(BeerType).filter(BeerType.name == name).first()
    if beer_type:
        beer_type.default_profile_id = profile.id
        return beer_type
    beer_type = BeerType(
        name=name,
        description=description,
        ideal_temp_min=temp_min,
        ideal_temp_max=temp_max,
        default_profile_id=profile.id,
    )
    db.add(beer_type)
    db.flush()
    return beer_type


def profile_setpoint(profile, elapsed_seconds):
    accumulated = 0
    segments = sorted(profile.segments, key=lambda item: item.segment_order)
    for segment in segments:
        accumulated += segment.duration_seconds
        if elapsed_seconds <= accumulated:
            return segment.target_sp, segment.segment_order
    return segments[-1].target_sp, segments[-1].segment_order


def create_finished_batch(db, recipe_name, tank, beer_type, profile, days_ago, duration_days, yeast, og, fg_target, noise_seed):
    existing = db.query(Batch).filter(Batch.recipe_name == recipe_name).first()
    if existing:
        db.query(CommandLog).filter(CommandLog.tank_id == existing.tank_id).delete(synchronize_session=False)
        db.query(Reading).filter(Reading.batch_id == existing.id).delete(synchronize_session=False)
        db.delete(existing)
        db.flush()

    started_at = datetime.utcnow() - timedelta(days=days_ago)
    ended_at = started_at + timedelta(days=duration_days)
    batch = Batch(
        tank_id=tank.id,
        beer_type_id=beer_type.id,
        recipe_name=recipe_name,
        yeast=yeast,
        og=og,
        fg_target=fg_target,
        started_at=started_at,
        ended_at=ended_at,
        status='finished',
        profile_id=profile.id,
    )
    db.add(batch)
    tank.status = 'finalizado'
    db.flush()

    total_hours = duration_days * 24
    current_time = started_at
    for index in range(0, total_hours + 1):
        elapsed = int((current_time - started_at).total_seconds())
        sp, segment_order = profile_setpoint(profile, elapsed)
        drift = math.sin((index + noise_seed) / 5) * 0.35
        settling = min(1, index / 18)
        pv = sp + drift + (1 - settling) * 1.2
        db.add(Reading(
            controller_id=tank.controller_id,
            tank_id=tank.id,
            batch_id=batch.id,
            ts=current_time,
            pv=round(pv, 2),
            sp_active=round(sp, 2),
            sp_written=round(sp, 2),
            mv=round(45 + math.sin(index / 6) * 12, 2),
            run_state=1,
            control_mode='auto',
            segment_number=segment_order,
            segment_time_remaining=None,
            status_word_1=0,
            status_word_2=0,
            status_word_3=0,
            source='simulator',
        ))
        current_time += timedelta(hours=6)

    for segment in sorted(profile.segments, key=lambda item: item.segment_order):
        db.add(CommandLog(
            controller_id=tank.controller_id,
            tank_id=tank.id,
            command_type=f'profile_setpoint_s{segment.segment_order}',
            register_address=reg.REG_SP_MAIN,
            value_sent=str(segment.target_sp),
            success=True,
            response_text='seed demo',
            issued_at=started_at + timedelta(seconds=sum(
                item.duration_seconds
                for item in profile.segments
                if item.segment_order < segment.segment_order
            )),
        ))

    return batch


def run():
    ensure_schema()
    db = SessionLocal()
    try:
        ipa_profile = get_or_create_profile(
            db,
            'Rampa Demo IPA',
            'Fermentacao ale com descanso de diacetil e cold crash.',
            [(1, 18.0, 72), (2, 20.0, 36), (3, 3.0, 48)],
        )
        lager_profile = get_or_create_profile(
            db,
            'Rampa Demo Lager',
            'Fermentacao lager lenta, descanso e maturacao fria.',
            [(1, 10.0, 144), (2, 15.0, 48), (3, 2.0, 120)],
        )

        ipa = get_or_create_beer_type(
            db,
            'IPA Americana Demo',
            ipa_profile,
            18,
            20,
            'Perfil lupulado para fermentacao ale limpa.',
        )
        lager = get_or_create_beer_type(
            db,
            'Pilsen Lager Demo',
            lager_profile,
            9,
            12,
            'Perfil lager com maturacao fria prolongada.',
        )

        controller_ipa = get_or_create_controller(db, 11, 'N1050 Demo IPA')
        controller_lager = get_or_create_controller(db, 12, 'N1050 Demo Lager')
        tank_ipa = get_or_create_tank(db, 'Fermentador Demo IPA', controller_ipa, 18)
        tank_lager = get_or_create_tank(db, 'Fermentador Demo Lager', controller_lager, 10)

        create_finished_batch(
            db,
            'IPA Citrus Demo - Lote Finalizado',
            tank_ipa,
            ipa,
            ipa_profile,
            days_ago=12,
            duration_days=7,
            yeast='US-05',
            og=1.058,
            fg_target=1.012,
            noise_seed=3,
        )
        create_finished_batch(
            db,
            'Pilsen Clara Demo - Lote Finalizado',
            tank_lager,
            lager,
            lager_profile,
            days_ago=24,
            duration_days=13,
            yeast='W-34/70',
            og=1.048,
            fg_target=1.010,
            noise_seed=11,
        )

        db.commit()
        print('Seed demo concluido: 2 cervejas finalizadas, rampas, tanques, leituras e logs.')
    finally:
        db.close()


if __name__ == '__main__':
    run()
