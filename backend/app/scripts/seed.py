from datetime import UTC, datetime, timedelta
import math
from pathlib import Path
import sys

if __package__ is None or __package__ == '':
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from sqlalchemy import inspect, text

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
        'name': 'Ale Padrao',
        'description': 'Fermentacao ale com descanso de diacetil e cold crash curto.',
        'segments': [(1, 18.0, 48), (2, 20.0, 24), (3, 4.0, 36)],
    },
    {
        'name': 'Lager Classica',
        'description': 'Fermentacao fria, descanso de diacetil e maturacao longa.',
        'segments': [(1, 10.0, 120), (2, 15.0, 36), (3, 2.0, 120)],
    },
    {
        'name': 'Saison Expressiva',
        'description': 'Rampa crescente para esterificacao controlada de levedura saison.',
        'segments': [(1, 19.0, 24), (2, 23.0, 36), (3, 26.0, 48), (4, 3.0, 24)],
    },
    {
        'name': 'Stout Limpa',
        'description': 'Perfil robusto de ale escura com estabilizacao final.',
        'segments': [(1, 17.5, 72), (2, 19.5, 24), (3, 5.0, 48)],
    },
    {
        'name': 'Kolsch Delicada',
        'description': 'Fermentacao limpa com maturacao fria curta para cervejas claras.',
        'segments': [(1, 16.0, 72), (2, 18.0, 24), (3, 3.0, 72)],
    },
    {
        'name': 'Belgian Alta',
        'description': 'Rampa quente para favorecer esterificacao em leveduras belgas.',
        'segments': [(1, 18.5, 24), (2, 21.0, 36), (3, 24.0, 48), (4, 4.0, 48)],
    },
    {
        'name': 'Weiss Frutada',
        'description': 'Perfil para trigo com inicio moderado e final mais aromatico.',
        'segments': [(1, 17.0, 36), (2, 20.0, 48), (3, 3.0, 36)],
    },
    {
        'name': 'Kveik Quente',
        'description': 'Fermentacao rapida em alta temperatura para leveduras kveik.',
        'segments': [(1, 30.0, 36), (2, 32.0, 24), (3, 5.0, 24)],
    },
]

BEER_TYPE_DEFS = [
    ('American IPA', 'Ale Padrao', 18, 20, 'Base lupulada com fermentacao limpa e final seco.'),
    ('West Coast IPA', 'Ale Padrao', 18, 20, 'IPA resinosa com perfil limpo para destacar lupulo.'),
    ('New England IPA', 'Ale Padrao', 18, 21, 'IPA turva com fermentacao levemente mais quente.'),
    ('Pilsen', 'Lager Classica', 9, 12, 'Lager clara com maturacao fria e alta limpidez.'),
    ('Helles', 'Lager Classica', 9, 12, 'Lager maltada, delicada e de fermentacao fria.'),
    ('Saison', 'Saison Expressiva', 19, 26, 'Cerveja esterificada com rampa crescente.'),
    ('Dry Stout', 'Stout Limpa', 17, 20, 'Ale escura seca com perfil estavel.'),
    ('Porter', 'Stout Limpa', 17, 20, 'Ale escura maltada com finalizacao fria curta.'),
    ('Witbier', 'Weiss Frutada', 17, 21, 'Trigo belga leve, aromatico e refrescante.'),
    ('Weissbier', 'Weiss Frutada', 17, 22, 'Trigo alemao com foco em ester e fenol.'),
    ('Kolsch', 'Kolsch Delicada', 15, 18, 'Cerveja clara hibrida com maturacao fria curta.'),
    ('Belgian Blond', 'Belgian Alta', 18, 24, 'Belga clara com rampa quente e final aromatico.'),
    ('Kveik Pale Ale', 'Kveik Quente', 28, 34, 'Ale rapida com fermentacao quente e perfil tropical.'),
]

CONTROLLER_DEFS = [
    (11, 'N1050 F01', True, utcnow_naive() - timedelta(minutes=2)),
    (12, 'N1050 F02', True, utcnow_naive() - timedelta(minutes=6)),
    (13, 'N1050 F03', True, utcnow_naive() - timedelta(minutes=1)),
    (14, 'N1050 F04', True, utcnow_naive() - timedelta(hours=3)),
    (15, 'N1050 F05', True, utcnow_naive() - timedelta(minutes=9)),
    (16, 'N1050 F06', True, utcnow_naive() - timedelta(minutes=4)),
    (17, 'N1050 F07', True, utcnow_naive() - timedelta(minutes=8)),
    (18, 'N1050 F08', True, utcnow_naive() - timedelta(minutes=3)),
    (19, 'N1050 F09', True, utcnow_naive() - timedelta(minutes=11)),
    (20, 'N1050 F10', True, utcnow_naive() - timedelta(minutes=5)),
    (21, 'N1050 Reserva 01', False, None),
    (22, 'N1050 Reserva 02', False, None),
    (23, 'N1050 Reserva 03', False, None),
    (24, 'N1050 Reserva 04', False, None),
    (25, 'N1050 Reserva 05', False, None),
]

TANK_DEFS = [
    ('Fermentador F01', 500, 'Sala fria A', 'fermentando', 18.0, 11),
    ('Fermentador F02', 750, 'Sala fria A', 'fermentando', 10.0, 12),
    ('Fermentador F03', 300, 'Sala fria B', 'fermentando', 24.0, 13),
    ('Fermentador F04', 1000, 'Sala fria B', 'fermentando', 18.0, 14),
    ('Fermentador F05', 500, 'Sala fria C', 'fermentando', 16.0, 15),
    ('Fermentador F06', 500, 'Sala fria C', 'fermentando', 20.0, 16),
    ('Fermentador F07', 750, 'Sala fria D', 'fermentando', 18.5, 17),
    ('Fermentador F08', 300, 'Sala fria D', 'fermentando', 17.0, 18),
    ('Fermentador F09', 500, 'Sala fria E', 'fermentando', 30.0, 19),
    ('Fermentador F10', 1000, 'Sala fria E', 'fermentando', 10.0, 20),
    ('Tanque Reserva 01', 250, 'Sala de brassagem', 'idle', None, 21),
    ('Tanque Reserva 02', 250, 'Sala de brassagem', 'idle', None, 22),
    ('Tanque CIP 01', 500, 'Area de limpeza', 'limpeza', None, 23),
    ('Tanque Piloto', 150, 'Bancada piloto', 'manutencao', None, 24),
    ('Tanque Barril', 300, 'Camara fria', 'idle', None, 25),
]

BATCH_DEFS = [
    ('IPA Citrus da Casa', 'Fermentador F01', 'American IPA', 'Ale Padrao', 'running', 2, None, 'US-05', 1.060, 1.012, 3),
    ('Pilsen Clara', 'Fermentador F02', 'Pilsen', 'Lager Classica', 'running', 6, None, 'W-34/70', 1.048, 1.010, 11),
    ('Saison Pimenta Rosa', 'Fermentador F03', 'Saison', 'Saison Expressiva', 'running', 1, None, 'Belle Saison', 1.054, 1.006, 7),
    ('Stout Cafe', 'Fermentador F04', 'Dry Stout', 'Stout Limpa', 'running', 4, None, 'S-04', 1.064, 1.018, 19),
    ('Kolsch Jardim', 'Fermentador F05', 'Kolsch', 'Kolsch Delicada', 'running', 3, None, 'K-97', 1.046, 1.009, 31),
    ('NEIPA Manga', 'Fermentador F06', 'New England IPA', 'Ale Padrao', 'running', 1, None, 'Verdant IPA', 1.066, 1.014, 37),
    ('Porter Baunilha', 'Fermentador F07', 'Porter', 'Stout Limpa', 'running', 5, None, 'London ESB', 1.058, 1.016, 41),
    ('Weiss Bananeira', 'Fermentador F08', 'Weissbier', 'Weiss Frutada', 'running', 2, None, 'WB-06', 1.050, 1.011, 43),
    ('Kveik Tropical', 'Fermentador F09', 'Kveik Pale Ale', 'Kveik Quente', 'running', 1, None, 'Voss Kveik', 1.052, 1.010, 47),
    ('Helles Maltada', 'Fermentador F10', 'Helles', 'Lager Classica', 'running', 8, None, 'S-189', 1.047, 1.009, 53),
    ('West Coast Lote 18', 'Fermentador F01', 'West Coast IPA', 'Ale Padrao', 'finished', 22, 7, 'US-05', 1.062, 1.011, 61),
    ('Pilsen Safra 12', 'Fermentador F02', 'Pilsen', 'Lager Classica', 'finished', 40, 16, 'W-34/70', 1.046, 1.009, 67),
    ('Belgian Blond Aurora', 'Fermentador F03', 'Belgian Blond', 'Belgian Alta', 'finished', 28, 9, 'BE-256', 1.058, 1.010, 71),
    ('Dry Stout Nitro', 'Fermentador F04', 'Dry Stout', 'Stout Limpa', 'finished', 35, 8, 'S-04', 1.052, 1.014, 73),
    ('Witbier Laranja', 'Fermentador F05', 'Witbier', 'Weiss Frutada', 'finished', 18, 6, 'M21 Belgian Wit', 1.044, 1.010, 79),
    ('Kolsch Primavera', 'Fermentador F06', 'Kolsch', 'Kolsch Delicada', 'finished', 31, 10, 'K-97', 1.045, 1.008, 83),
    ('Saison Campo', 'Fermentador F07', 'Saison', 'Saison Expressiva', 'finished', 25, 8, 'Belle Saison', 1.056, 1.005, 89),
    ('Porter Tostada', 'Fermentador F08', 'Porter', 'Stout Limpa', 'finished', 45, 9, 'London ESB', 1.060, 1.017, 97),
    ('Kveik Pomelo', 'Fermentador F09', 'Kveik Pale Ale', 'Kveik Quente', 'finished', 16, 4, 'Voss Kveik', 1.050, 1.009, 101),
    ('Helles Jardim', 'Fermentador F10', 'Helles', 'Lager Classica', 'finished', 55, 18, 'S-189', 1.048, 1.010, 107),
]


def ensure_schema():
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name != 'sqlite':
        return

    inspector = inspect(engine)
    if 'beer_types' not in set(inspector.get_table_names()):
        return

    columns = {column['name'] for column in inspector.get_columns('beer_types')}
    if 'default_profile_id' not in columns:
        with engine.begin() as connection:
            connection.execute(text('ALTER TABLE beer_types ADD COLUMN default_profile_id INTEGER'))


def clear_database(db):
    for model in [AlarmEvent, CommandLog, Reading, Batch, Tank, Controller, BeerType, TemperatureProfile]:
        db.query(model).delete(synchronize_session=False)
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
            notes='Tanque criado pela carga inicial.',
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
        status_word_1 = 1 if abs(pv - sp) > 0.9 else 0

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
            response_text=f'SP {segment.target_sp} aplicado para {batch.recipe_name}',
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
        response_text='Controlador colocado em automatico.',
        issued_at=start_at + timedelta(minutes=2),
    ))


def create_batches(db, tanks, beer_types, profiles):
    now = utcnow_naive().replace(microsecond=0)
    for recipe_name, tank_name, beer_name, profile_name, status, started_days_ago, duration_days, yeast, og, fg_target, noise_seed in BATCH_DEFS:
        tank = tanks[tank_name]
        beer_type = beer_types[beer_name]
        profile = profiles[profile_name]
        started_at = now - timedelta(days=started_days_ago) if started_days_ago is not None else None
        ended_at = started_at + timedelta(days=duration_days) if started_at and duration_days is not None else None

        batch = Batch(
            tank_id=tank.id,
            beer_type_id=beer_type.id,
            profile_id=profile.id,
            recipe_name=recipe_name,
            yeast=yeast,
            og=og,
            fg_target=fg_target,
            started_at=started_at,
            ended_at=ended_at,
            status=status,
        )
        db.add(batch)
        db.flush()

        if started_at:
            create_batch_readings(db, batch, tank, profile, started_at, ended_at or now, noise_seed)
            create_profile_commands(db, batch, tank, profile, started_at)


def create_idle_readings(db, tanks):
    now = utcnow_naive().replace(microsecond=0)
    for offset, tank_name in enumerate(['Tanque Reserva 01', 'Tanque Reserva 02', 'Tanque CIP 01', 'Tanque Piloto', 'Tanque Barril']):
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
        ('Fermentador F01', now - timedelta(hours=7), now - timedelta(hours=6, minutes=20), 'warning', 'temperature_deviation', 'PV ficou acima do SP durante a estabilizacao inicial.', 'status_word_1=1'),
        ('Fermentador F03', now - timedelta(minutes=35), None, 'critical', 'sensor_timeout', 'Leitura atrasada simulada para testar alerta ativo.', 'last_seen_delta=2100'),
        ('Tanque Reserva 01', now - timedelta(days=1, hours=2), now - timedelta(days=1, hours=1, minutes=30), 'info', 'manual_mode', 'Controlador reserva deixado em manual durante higienizacao.', 'run_state=0'),
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
        clear_database(db)
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
        print(f'- Lotes running: {sum(1 for item in BATCH_DEFS if item[4] == "running")}')
        print(f'- Lotes finished: {sum(1 for item in BATCH_DEFS if item[4] == "finished")}')
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == '__main__':
    run()
