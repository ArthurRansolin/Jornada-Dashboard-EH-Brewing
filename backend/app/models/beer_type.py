from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class BeerType(Base):
    __tablename__ = 'beer_types'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    ideal_temp_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    ideal_temp_max: Mapped[float | None] = mapped_column(Float, nullable=True)
