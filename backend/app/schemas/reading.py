from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ReadingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    controller_id: int | None = None
    tank_id: int | None = None
    batch_id: int | None = None
    ts: datetime
    pv: float | None = None
    sp_active: float | None = None
    sp_written: float | None = None
    mv: float | None = None
    run_state: int | None = None
    control_mode: str | None = None
    segment_number: int | None = None
    segment_time_remaining: int | None = None
    status_word_1: int | None = None
    status_word_2: int | None = None
    status_word_3: int | None = None
    source: str
