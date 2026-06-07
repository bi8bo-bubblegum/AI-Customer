import uuid as uuid_lib
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id: Mapped[uuid_lib.UUID] = mapped_column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    user_id: Mapped[uuid_lib.UUID] = mapped_column(Uuid, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=False)  # complaint | claim | suggestion
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | processing | resolved | closed
    priority: Mapped[str] = mapped_column(String(20), default="normal")  # low | normal | high | urgent
    assigned_to: Mapped[str] = mapped_column(String(100), nullable=True)
    resolution: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())