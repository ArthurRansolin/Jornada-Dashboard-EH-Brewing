from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Tank(Base):
    __tablename__ = 'tanks'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    capacity_l: Mapped[float | None] = mapped_column(Float, nullable=True)
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default='idle')
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    ideal_temp_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    controller_id: Mapped[int | None] = mapped_column(ForeignKey('controllers.id'), nullable=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    controller = relationship('Controller', back_populates='tank')
    readings = relationship('Reading', back_populates='tank')
