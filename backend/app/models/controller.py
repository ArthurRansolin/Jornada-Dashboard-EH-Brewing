from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Controller(Base):
    __tablename__ = 'controllers'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(50), default='N1050')
    slave_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    serial_port: Mapped[str | None] = mapped_column(String(100), nullable=True)
    baud_rate: Mapped[int] = mapped_column(Integer, default=9600)
    parity: Mapped[str] = mapped_column(String(1), default='N')
    data_bits: Mapped[int] = mapped_column(Integer, default=8)
    stop_bits: Mapped[int] = mapped_column(Integer, default=1)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tank = relationship('Tank', back_populates='controller', uselist=False)
