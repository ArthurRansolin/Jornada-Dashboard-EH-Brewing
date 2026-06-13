from pydantic import BaseModel, ConfigDict


class BeerTypeBase(BaseModel):
    name: str
    description: str | None = None
    ideal_temp_min: float | None = None
    ideal_temp_max: float | None = None
    default_profile_id: int | None = None


class BeerTypeCreate(BeerTypeBase):
    pass


class BeerTypeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    ideal_temp_min: float | None = None
    ideal_temp_max: float | None = None
    default_profile_id: int | None = None


class BeerTypeOut(BeerTypeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
