from pydantic import BaseModel, ConfigDict


class TemperatureProfileSegmentBase(BaseModel):
    segment_order: int
    target_sp: float
    duration_seconds: int


class TemperatureProfileSegmentCreate(TemperatureProfileSegmentBase):
    pass


class TemperatureProfileSegmentOut(TemperatureProfileSegmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    profile_id: int


class TemperatureProfileBase(BaseModel):
    name: str
    description: str | None = None
    mode: str = 'server_managed'
    time_base: str = 'HH:MM'
    tolerance: int | None = None
    resume_mode: int | None = None


class TemperatureProfileCreate(TemperatureProfileBase):
    segments: list[TemperatureProfileSegmentCreate] = []


class TemperatureProfileUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    mode: str | None = None
    time_base: str | None = None
    tolerance: int | None = None
    resume_mode: int | None = None
    segments: list[TemperatureProfileSegmentCreate] | None = None


class TemperatureProfileOut(TemperatureProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    segments: list[TemperatureProfileSegmentOut] = []
