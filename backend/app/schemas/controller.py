from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ControllerBase(BaseModel):
    name: str
    model: str = 'N1050'
    slave_id: int
    serial_port: str | None = None
    baud_rate: int = 9600
    parity: str = 'N'
    data_bits: int = 8
    stop_bits: int = 1
    enabled: bool = True


class ControllerCreate(ControllerBase):
    pass


class ControllerUpdate(BaseModel):
    name: str | None = None
    model: str | None = None
    slave_id: int | None = None
    serial_port: str | None = None
    baud_rate: int | None = None
    parity: str | None = None
    data_bits: int | None = None
    stop_bits: int | None = None
    enabled: bool | None = None


class ControllerOut(ControllerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    last_seen_at: datetime | None = None
    created_at: datetime
