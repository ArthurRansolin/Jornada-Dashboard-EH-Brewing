from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Batch(Base):
    __tablename__ = 'batches'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tank_id: Mapped[int] = mapped_column(ForeignKey('tanks.id'))
    beer_type_id: Mapped[int | None] = mapped_column(ForeignKey('beer_types.id'), nullable=True)
    recipe_name: Mapped[str] = mapped_column(String(150), nullable=False)
    yeast: Mapped[str | None] = mapped_column(String(100), nullable=True)
    og: Mapped[float | None] = mapped_column(Float, nullable=True)
    fg_target: Mapped[float | None] = mapped_column(Float, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default='draft')
    profile_id: Mapped[int | None] = mapped_column(ForeignKey('temperature_profiles.id'), nullable=True)
