from datetime import datetime, timedelta


def get_profile_setpoint(segments: list[dict], started_at: datetime, now: datetime | None = None):
    now = now or datetime.utcnow()
    elapsed = int((now - started_at).total_seconds())
    acc = 0
    for segment in sorted(segments, key=lambda x: x['segment_order']):
        acc += segment['duration_seconds']
        if elapsed <= acc:
            return segment['target_sp'], segment['segment_order']
    if segments:
        last = sorted(segments, key=lambda x: x['segment_order'])[-1]
        return last['target_sp'], last['segment_order']
    return None, None
