import uuid
from decimal import Decimal

from app.database import Base
from sqlalchemy import String, Float, Integer, Boolean, DateTime, func, Uuid, Numeric, Time
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, time


class BusRoute(Base):
    __tablename__ = "bus_routes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    route_name: Mapped[str] = mapped_column(String(200), nullable=False)
    departure_station: Mapped[str] = mapped_column(String(50), nullable=False)
    arrival_station: Mapped[str] = mapped_column(String(50), nullable=False)
    distance_km: Mapped[float] = mapped_column(Float, nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

class BusSchedule(Base):
    __tablename__ = "bus_schedules"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    route_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    departure_time: Mapped[time] = mapped_column(Time, nullable=False)
    arrival_time: Mapped[time] = mapped_column(Time, nullable=False)
    bus_type: Mapped[str] = mapped_column(String(20), nullable=False)  # 普通 | 商务 | 豪华
    total_seats: Mapped[int] = mapped_column(Integer, nullable=False)
    available_seats: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    operating_days: Mapped[str] = mapped_column(String(20), nullable=False)  # "1,2,3,4,5"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())