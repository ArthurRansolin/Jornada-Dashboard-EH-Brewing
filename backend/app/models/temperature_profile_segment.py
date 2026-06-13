from sqlalchemy import Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class TemperatureProfileSegment(Base):
    __tablename__ = 'temperature_profile_segments'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey('temperature_profiles.id'))
    segment_order: Mapped[int] = mapped_column(Integer, nullable=False)
    target_sp: Mapped[float] = mapped_column(Float, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)

    profile = relationship('TemperatureProfile', back_populates='segments')
