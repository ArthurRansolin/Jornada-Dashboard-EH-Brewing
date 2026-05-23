from app.services import n1050_registers as reg


def parse_process_snapshot(registers: list[int]) -> dict:
    data = {
        'sp_active': registers[0] if len(registers) > 0 else None,
        'pv': registers[1] if len(registers) > 1 else None,
        'mv': registers[2] if len(registers) > 2 else None,
        'status_word_1': None,
        'status_word_2': None,
        'status_word_3': None,
    }
    return data


def parse_full_snapshot(raw: dict) -> dict:
    return {
        'sp_active': raw.get(reg.REG_SP_ACTIVE),
        'pv': raw.get(reg.REG_PV),
        'mv': raw.get(reg.REG_MV),
        'status_word_1': raw.get(reg.REG_STATUS1),
        'status_word_2': raw.get(reg.REG_STATUS2),
        'status_word_3': raw.get(reg.REG_STATUS3),
        'run_state': raw.get(reg.REG_RUN),
        'control_mode': 'manual' if raw.get(reg.REG_CTRL_MODE) == 1 else 'auto',
        'segment_number': raw.get(reg.REG_ACTIVE_SEGMENT),
        'segment_time_remaining': raw.get(reg.REG_SEGMENT_TIME),
    }
