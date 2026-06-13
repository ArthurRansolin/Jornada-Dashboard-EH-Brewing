from datetime import datetime
from pydantic import BaseModel, ConfigDict


class BatchCreate(BaseModel):
    tank_id: int
    beer_type_id: int | None = None
    profile_id: int
    recipe_name: str
    yeast: str | None = None
    og: float | None = None
    fg_target: float | None = None


class BatchStart(BaseModel):
    tank_id: int
    beer_type_id: int | None = None
    profile_id: int
    recipe_name: str
    yeast: str | None = None
    og: float | None = None
    fg_target: float | None = None


class BatchUpdate(BaseModel):
    status: str | None = None
    ended_at: datetime | None = None


class BatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tank_id: int
    beer_type_id: int | None = None
    recipe_name: str
    yeast: str | None = None
    og: float | None = None
    fg_target: float | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    status: str
    profile_id: int | None = None
