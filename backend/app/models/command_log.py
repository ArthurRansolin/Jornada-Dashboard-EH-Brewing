from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class CommandLog(Base):
    __tablename__ = 'command_logs'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    controller_id: Mapped[int | None] = mapped_column(ForeignKey('controllers.id'), nullable=True)
    tank_id: Mapped[int | None] = mapped_column(ForeignKey('tanks.id'), nullable=True)
    command_type: Mapped[str] = mapped_column(String(50), nullable=False)
    register_address: Mapped[int | None] = mapped_column(Integer, nullable=True)
    value_sent: Mapped[str | None] = mapped_column(String(100), nullable=True)
    success: Mapped[bool] = mapped_column(Boolean, default=False)
    response_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
