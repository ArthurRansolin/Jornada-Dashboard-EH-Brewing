from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TankBase(BaseModel):
    name: str
    capacity_l: float | None = None
    location: str | None = None
    status: str = 'idle'
    notes: str | None = None
    ideal_temp_c: float | None = None
    controller_id: int | None = None


class TankCreate(TankBase):
    pass


class TankUpdate(BaseModel):
    name: str | None = None
    capacity_l: float | None = None
    location: str | None = None
    status: str | None = None
    notes: str | None = None
    ideal_temp_c: float | None = None
    controller_id: int | None = None


class TankOut(TankBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
