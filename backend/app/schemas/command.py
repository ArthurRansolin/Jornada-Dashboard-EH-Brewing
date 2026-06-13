from pydantic import BaseModel


class SetpointCommand(BaseModel):
    value: float


class RunCommand(BaseModel):
    enabled: bool


class ModeCommand(BaseModel):
    mode: str


class ManualMVCommand(BaseModel):
    value: float
