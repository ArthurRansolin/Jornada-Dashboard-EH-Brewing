from datetime import datetime
from pydantic import BaseModel


class CommandLogOut(BaseModel):
    id: int
    controller_id: int | None = None
    tank_id: int | None = None
    command_type: str
    register_address: int | None = None
    value_sent: str | None = None
    success: bool
    response_text: str | None = None
    issued_at: datetime

    class Config:
        from_attributes = True
