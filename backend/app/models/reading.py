from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Reading(Base):
    __tablename__ = 'readings'
    __table_args__ = (
        Index('idx_readings_tank_ts', 'tank_id', 'ts'),
        Index('idx_readings_controller_ts', 'controller_id', 'ts'),
        Index('idx_readings_batch_ts', 'batch_id', 'ts'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    controller_id: Mapped[int | None] = mapped_column(ForeignKey('controllers.id'), nullable=True)
    tank_id: Mapped[int | None] = mapped_column(ForeignKey('tanks.id'), nullable=True)
    batch_id: Mapped[int | None] = mapped_column(ForeignKey('batches.id'), nullable=True)
    ts: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    pv: Mapped[float | None] = mapped_column(Float, nullable=True)
    sp_active: Mapped[float | None] = mapped_column(Float, nullable=True)
    sp_written: Mapped[float | None] = mapped_column(Float, nullable=True)
    mv: Mapped[float | None] = mapped_column(Float, nullable=True)
    run_state: Mapped[int | None] = mapped_column(Integer, nullable=True)
    control_mode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    segment_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    segment_time_remaining: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status_word_1: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status_word_2: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status_word_3: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source: Mapped[str] = mapped_column(String(20), default='hardware')

    tank = relationship('Tank', back_populates='readings')
