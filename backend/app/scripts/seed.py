from datetime import UTC, datetime, timedelta
import math
from pathlib import Path
import sys

if __package__ is None or __package__ == '':
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from sqlalchemy import inspect, or_, text

from app.core.database import Base, SessionLocal, engine
from app.models.alarm_event import AlarmEvent
from app.models.batch import Batch
from app.models.beer_type import BeerType
from app.models.command_log import CommandLog
from app.models.controller import Controller
from app.models.reading import Reading
from app.models.tank import Tank
from app.models.temperature_profile import TemperatureProfile
from app.models.temperature_profile_segment import TemperatureProfileSegment
from app.services import n1050_registers as reg


def utcnow_naive():
    return datetime.now(UTC).replace(tzinfo=None)


PROFILE_DEFS = [
    {
        'name': 'Demo Ale Rapida',
        'description': 'Fermentacao ale com descanso de diacetil e cold crash curto.',
        'segments': [(1, 18.0, 48), (2, 20.0, 24), (3, 4.0, 36)],
    },
    {
        'name': 'Demo Lager Classica',
        'description': 'Fermentacao fria, descanso de diacetil e maturacao longa.',
        'segments': [(1, 10.0, 120), (2, 15.0, 36), (3, 2.0, 120)],
    },
    {
        'name': 'Demo Saison Expressiva',
        'description': 'Rampa crescente para esterificacao controlada de levedura saison.',
        'segments': [(1, 19.0, 24), (2, 23.0, 36), (3, 26.0, 48), (4, 3.0, 24)],
    },
    {
        'name': 'Demo Stout Limpa',
        'description': 'Perfil robusto de ale escura com estabilizacao final.',
        'segments': [(1, 17.5, 72), (2, 19.5, 24), (3, 5.0, 48)],
    },
]

BEER_TYPE_DEFS = [
    ('IPA Americana Demo', 'Demo Ale Rapida', 18, 20, 'Base lupulada para testar fermentacao ale.'),
    ('Pilsen Lager Demo', 'Demo Lager Classica', 9, 12, 'Lager clara com maturacao fria.'),
    ('Saison Demo', 'Demo Saison Expressiva', 19, 26, 'Cerveja esterificada com rampa crescente.'),
    ('Stout Demo', 'Demo Stout Limpa', 17, 20, 'Ale escura para perfil estavel e finalizacao fria.'),
    ('Witbier Demo', 'Demo Ale Rapida', 18, 21, 'Trigo leve para testes de cadastro sem lote ativo.'),
]

CONTROLLER_DEFS = [
    (11, 'N1050 Demo F01', True, utcnow_naive() - timedelta(minutes=2)),
    (12, 'N1050 Demo F02', True, utcnow_naive() - timedelta(minutes=6)),
    (13, 'N1050 Demo F03', True, utcnow_naive() - timedelta(minutes=1)),
    (14, 'N1050 Demo F04', True, utcnow_naive() - timedelta(hours=3)),
    (15, 'N1050 Demo Reserva', False, None),
]

TANK_DEFS = [
    ('Fermentador Demo F01', 500, 'Sala fria A', 'fermentando', 18.0, 11),
    ('Fermentador Demo F02', 750, 'Sala fria A', 'finalizado', 10.0, 12),
    ('Fermentador Demo F03', 300, 'Sala fria B', 'fermentando', 24.0, 13),
    ('Fermentador Demo F04', 1000, 'Sala fria B', 'limpeza', 5.0, 14),
    ('Tanque Demo Reserva', 250, 'Sala de brassagem', 'idle', None, 15),
    ('Tanque Demo Sem Controlador', 150, 'Bancada piloto', 'manutencao', None, None),
]

BATCH_DEFS = [
    {
        'recipe_name': 'IPA Citrus Demo - Em Fermentacao',
        'tank_name': 'Fermentador Demo F01',
        'beer_type': 'IPA Americana Demo',
        'profile': 'Demo Ale Rapida',
        'status': 'running',
        'started_days_ago': 2,
        'duration_days': None,
        'yeast': 'US-05',
        'og': 1.060,
        'fg_target': 1.012,
        'noise_seed': 3,
    },
    {
        'recipe_name': 'Pilsen Clara Demo - Lote Finalizado',
        'tank_name': 'Fermentador Demo F02',
        'beer_type': 'Pilsen Lager Demo',
        'profile': 'Demo Lager Classica',
        'status': 'finished',
        'started_days_ago': 20,
        'duration_days': 12,
        'yeast': 'W-34/70',
        'og': 1.048,
        'fg_target': 1.010,
        'noise_seed': 11,
    },
    {
        'recipe_name': 'Saison Pimenta Rosa Demo - Em Fermentacao',
        'tank_name': 'Fermentador Demo F03',
        'beer_type': 'Saison Demo',
        'profile': 'Demo Saison Expressiva',
        'status': 'running',
        'started_days_ago': 1,
        'duration_days': None,
        'yeast': 'Belle Saison',
        'og': 1.054,
        'fg_target': 1.006,
        'noise_seed': 7,
    },
    {
        'recipe_name': 'Stout Café Demo - Lote Finalizado',
        'tank_name': 'Fermentador Demo F04',
        'beer_type': 'Stout Demo',
        'profile': 'Demo Stout Limpa',
        'status': 'finished',
        'started_days_ago': 32,
        'duration_days': 8,
        'yeast': 'S-04',
        'og': 1.064,
        'fg_target': 1.018,
        'noise_seed': 19,
    },
    {
        'recipe_name': 'Witbier Laranja Demo - Planejado',
        'tank_name': 'Tanque Demo Reserva',
        'beer_type': 'Witbier Demo',
        'profile': 'Demo Ale Rapida',
        'status': 'draft',
        'started_days_ago': None,
        'duration_days': None,
        'yeast': 'M21 Belgian Wit',
        'og': 1.044,
        'fg_target': 1.010,
        'noise_seed': 23,
    },
]


def ensure_schema():
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name != 'sqlite':
        return

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    if 'beer_types' in tables:
        columns = {column['name'] for column in inspector.get_columns('beer_types')}
        if 'default_profile_id' not in columns:
            with engine.begin() as connection:
                connection.execute(text('ALTER TABLE beer_types ADD COLUMN default_profile_id INTEGER'))


def delete_demo_data(db):
    recipe_names = [item['recipe_name'] for item in BATCH_DEFS]
    tank_names = [item[0] for item in TANK_DEFS]
    controller_slave_ids = [item[0] for item in CONTROLLER_DEFS]
    beer_names = [item[0] for item in BEER_TYPE_DEFS]
    profile_names = [item['name'] for item in PROFILE_DEFS]

    demo_controller_ids = [
        item.id for item in db.query(Controller).filter(Controller.slave_id.in_(controller_slave_ids)).all()
    ]
    tank_filters = [Tank.name.in_(tank_names)]
    if demo_controller_ids:
        tank_filters.append(Tank.controller_id.in_(demo_controller_ids))
    demo_tank_ids = [item.id for item in db.query(Tank).filter(or_(*tank_filters)).all()]

    batch_filters = [Batch.recipe_name.in_(recipe_names)]
    if demo_tank_ids:
        batch_filters.append(Batch.tank_id.in_(demo_tank_ids))
    demo_batches = db.query(Batch).filter(or_(*batch_filters)).all()
    demo_batch_ids = [item.id for item in demo_batches]

    if demo_batch_ids:
        db.query(Reading).filter(Reading.batch_id.in_(demo_batch_ids)).delete(synchronize_session=False)
    if demo_tank_ids:
        db.query(Reading).filter(Reading.tank_id.in_(demo_tank_ids)).delete(synchronize_session=False)
        db.query(CommandLog).filter(CommandLog.tank_id.in_(demo_tank_ids)).delete(synchronize_session=False)
        db.query(AlarmEvent).filter(AlarmEvent.tank_id.in_(demo_tank_ids)).delete(synchronize_session=False)
    if demo_controller_ids:
        db.query(CommandLog).filter(CommandLog.controller_id.in_(demo_controller_ids)).delete(synchronize_session=False)
        db.query(AlarmEvent).filter(AlarmEvent.controller_id.in_(demo_controller_ids)).delete(synchronize_session=False)

    db.query(Batch).filter(or_(*batch_filters)).delete(synchronize_session=False)
    db.query(Tank).filter(or_(*tank_filters)).delete(synchronize_session=False)
    db.query(Controller).filter(Controller.slave_id.in_(controller_slave_ids)).delete(synchronize_session=False)
    db.query(BeerType).filter(BeerType.name.in_(beer_names)).delete(synchronize_session=False)

    profiles = db.query(TemperatureProfile).filter(TemperatureProfile.name.in_(profile_names)).all()
    for profile in profiles:
        db.delete(profile)
    db.flush()


def create_profiles(db):
    profiles = {}
    for item in PROFILE_DEFS:
        profile = TemperatureProfile(
            name=item['name'],
            description=item['description'],
            mode='server_managed',
            time_base='HH:MM',
            tolerance=1,
            resume_mode=1,
        )
        db.add(profile)
        db.flush()
        for segment_order, target_sp, hours in item['segments']:
            db.add(TemperatureProfileSegment(
                profile_id=profile.id,
                segment_order=segment_order,
                target_sp=target_sp,
                duration_seconds=int(hours * 3600),
            ))
        profiles[profile.name] = profile
    db.flush()
    return profiles


def create_beer_types(db, profiles):
    beer_types = {}
    for name, profile_name, temp_min, temp_max, description in BEER_TYPE_DEFS:
        beer_type = BeerType(
            name=name,
            description=description,
            ideal_temp_min=temp_min,
            ideal_temp_max=temp_max,
            default_profile_id=profiles[profile_name].id,
        )
        db.add(beer_type)
        beer_types[name] = beer_type
    db.flush()
    return beer_types


def create_controllers(db):
    controllers = {}
    for slave_id, name, enabled, last_seen_at in CONTROLLER_DEFS:
        controller = Controller(
            name=name,
            model='N1050',
            slave_id=slave_id,
            serial_port='SIMULATOR',
            baud_rate=9600,
            parity='N',
            data_bits=8,
            stop_bits=1,
            enabled=enabled,
            last_seen_at=last_seen_at,
        )
        db.add(controller)
        controllers[slave_id] = controller
    db.flush()
    return controllers


def create_tanks(db, controllers):
    tanks = {}
    for name, capacity_l, location, status, ideal_temp_c, slave_id in TANK_DEFS:
        tank = Tank(
            name=name,
            capacity_l=capacity_l,
            location=location,
            status=status,
            notes='Tanque criado pela seed completa de demonstracao.',
            ideal_temp_c=ideal_temp_c,
            controller_id=controllers[slave_id].id if slave_id else None,
        )
        db.add(tank)
        tanks[name] = tank
    db.flush()
    return tanks


def profile_setpoint(profile, elapsed_seconds):
    accumulated = 0
    segments = sorted(profile.segments, key=lambda item: item.segment_order)
    for segment in segments:
        accumulated += segment.duration_seconds
        if elapsed_seconds <= accumulated:
            return segment.target_sp, segment.segment_order, accumulated - elapsed_seconds
    last = segments[-1]
    return last.target_sp, last.segment_order, 0


def create_batch_readings(db, batch, tank, profile, start_at, end_at, noise_seed):
    current_time = start_at
    index = 0
    while current_time <= end_at:
        elapsed = int((current_time - start_at).total_seconds())
        sp, segment_order, remaining = profile_setpoint(profile, elapsed)
        drift = math.sin((index + noise_seed) / 4.5) * 0.32
        cooling_load = math.cos((index + noise_seed) / 9) * 8
        settling = min(1, index / 8)
        pv = sp + drift + (1 - settling) * 1.1
        status_word_1 = 0
        if abs(pv - sp) > 0.9:
            status_word_1 = 1

        db.add(Reading(
            controller_id=tank.controller_id,
            tank_id=tank.id,
            batch_id=batch.id,
            ts=current_time,
            pv=round(pv, 2),
            sp_active=round(sp, 2),
            sp_written=round(sp, 2),
            mv=round(48 + cooling_load, 2),
            run_state=1 if batch.status == 'running' else 0,
            control_mode='auto',
            segment_number=segment_order,
            segment_time_remaining=remaining,
            status_word_1=status_word_1,
            status_word_2=0,
            status_word_3=0,
            source='simulator',
        ))
        current_time += timedelta(hours=3)
        index += 1


def create_profile_commands(db, batch, tank, profile, start_at):
    elapsed = 0
    for segment in sorted(profile.segments, key=lambda item: item.segment_order):
        db.add(CommandLog(
            controller_id=tank.controller_id,
            tank_id=tank.id,
            command_type=f'profile_segment_{segment.segment_order}',
            register_address=reg.REG_SP_MAIN,
            value_sent=str(segment.target_sp),
            success=True,
            response_text=f'Demo: SP {segment.target_sp} aplicado para {batch.recipe_name}',
            issued_at=start_at + timedelta(seconds=elapsed),
        ))
        elapsed += segment.duration_seconds

    db.add(CommandLog(
        controller_id=tank.controller_id,
        tank_id=tank.id,
        command_type='run',
        register_address=None,
        value_sent='1',
        success=True,
        response_text='Demo: controlador colocado em automatico.',
        issued_at=start_at + timedelta(minutes=2),
    ))


def create_batches(db, tanks, beer_types, profiles):
    now = utcnow_naive().replace(microsecond=0)
    batches = {}
    for item in BATCH_DEFS:
        tank = tanks[item['tank_name']]
        beer_type = beer_types[item['beer_type']]
        profile = profiles[item['profile']]
        started_at = None
        ended_at = None

        if item['started_days_ago'] is not None:
            started_at = now - timedelta(days=item['started_days_ago'])
        if item['duration_days'] is not None and started_at:
            ended_at = started_at + timedelta(days=item['duration_days'])

        batch = Batch(
            tank_id=tank.id,
            beer_type_id=beer_type.id,
            profile_id=profile.id,
            recipe_name=item['recipe_name'],
            yeast=item['yeast'],
            og=item['og'],
            fg_target=item['fg_target'],
            started_at=started_at,
            ended_at=ended_at,
            status=item['status'],
        )
        db.add(batch)
        db.flush()
        batches[batch.recipe_name] = batch

        if started_at:
            reading_end = ended_at or now
            create_batch_readings(db, batch, tank, profile, started_at, reading_end, item['noise_seed'])
            create_profile_commands(db, batch, tank, profile, started_at)

    db.flush()
    return batches


def create_idle_readings(db, tanks):
    now = utcnow_naive().replace(microsecond=0)
    for offset, tank_name in enumerate(['Tanque Demo Reserva', 'Tanque Demo Sem Controlador']):
        tank = tanks[tank_name]
        for index in range(8):
            db.add(Reading(
                controller_id=tank.controller_id,
                tank_id=tank.id,
                batch_id=None,
                ts=now - timedelta(hours=(8 - index)),
                pv=round(21.5 + math.sin(index + offset) * 0.4, 2),
                sp_active=None,
                sp_written=None,
                mv=0,
                run_state=0,
                control_mode='manual' if tank.controller_id else None,
                segment_number=None,
                segment_time_remaining=None,
                status_word_1=0,
                status_word_2=0,
                status_word_3=0,
                source='simulator',
            ))


def create_alarms(db, tanks):
    now = utcnow_naive().replace(microsecond=0)
    alarm_defs = [
        (
            'Fermentador Demo F01',
            now - timedelta(hours=7),
            now - timedelta(hours=6, minutes=20),
            'warning',
            'temperature_deviation',
            'PV ficou acima do SP durante a estabilizacao inicial.',
            'status_word_1=1',
        ),
        (
            'Fermentador Demo F03',
            now - timedelta(minutes=35),
            None,
            'critical',
            'sensor_timeout',
            'Leitura atrasada simulada para testar alerta ativo.',
            'last_seen_delta=2100',
        ),
        (
            'Tanque Demo Reserva',
            now - timedelta(days=1, hours=2),
            now - timedelta(days=1, hours=1, minutes=30),
            'info',
            'manual_mode',
            'Controlador reserva deixado em manual durante higienizacao.',
            'run_state=0',
        ),
    ]
    for tank_name, started_at, ended_at, severity, alarm_type, message, raw_status in alarm_defs:
        tank = tanks[tank_name]
        db.add(AlarmEvent(
            tank_id=tank.id,
            controller_id=tank.controller_id,
            started_at=started_at,
            ended_at=ended_at,
            severity=severity,
            alarm_type=alarm_type,
            message=message,
            raw_status=raw_status,
        ))


def run():
    ensure_schema()
    db = SessionLocal()
    try:
        delete_demo_data(db)
        profiles = create_profiles(db)
        beer_types = create_beer_types(db, profiles)
        controllers = create_controllers(db)
        tanks = create_tanks(db, controllers)
        create_batches(db, tanks, beer_types, profiles)
        create_idle_readings(db, tanks)
        create_alarms(db, tanks)

        db.commit()
        print('Seed completa concluida.')
        print(f'- Rampas: {len(PROFILE_DEFS)}')
        print(f'- Tipos de cerveja: {len(BEER_TYPE_DEFS)}')
        print(f'- Controladores: {len(CONTROLLER_DEFS)}')
        print(f'- Tanques: {len(TANK_DEFS)}')
        print(f'- Lotes: {len(BATCH_DEFS)}')
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == '__main__':
    run()
