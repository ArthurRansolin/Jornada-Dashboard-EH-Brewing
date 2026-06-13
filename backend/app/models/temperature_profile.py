from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class TemperatureProfile(Base):
    __tablename__ = 'temperature_profiles'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    mode: Mapped[str] = mapped_column(String(30), default='server_managed')
    time_base: Mapped[str] = mapped_column(String(10), default='HH:MM')
    tolerance: Mapped[int | None] = mapped_column(Integer, nullable=True)
    resume_mode: Mapped[int | None] = mapped_column(Integer, nullable=True)

    segments = relationship('TemperatureProfileSegment', back_populates='profile', cascade='all, delete-orphan')
