import uuid
from datetime import datetime, time
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class BusRouteResponse(BaseModel):
    id: uuid.UUID
    route_name: str
    departure_station: str
    arrival_station: str
    distance_km: Optional[float] = None
    duration_minutes: Optional[int] = None
    is_active: bool

    model_config = {"from_attributes": True}


class BusScheduleResponse(BaseModel):
    id: uuid.UUID
    route_id: uuid.UUID
    departure_time: time
    arrival_time: time
    bus_type: str
    total_seats: int
    available_seats: int
    price: Decimal
    operating_days: str
    is_active: bool

    model_config = {"from_attributes": True}


class CreateRouteRequest(BaseModel):
    route_name: str = Field(..., max_length=100)
    departure_station: str = Field(..., max_length=50)
    arrival_station: str = Field(..., max_length=50)
    distance_km: Optional[float] = None
    duration_minutes: Optional[int] = None


class CreateScheduleRequest(BaseModel):
    route_id: uuid.UUID
    departure_time: time
    arrival_time: time
    bus_type: str = Field(..., pattern="^(普通|商务|豪华)$")
    total_seats: int = Field(..., gt=0)
    available_seats: int = Field(..., ge=0)
    price: Decimal = Field(..., gt=0)
    operating_days: str = Field(..., pattern=r"^\d(,\d)*$")


class UpdateScheduleRequest(BaseModel):
    departure_time: Optional[time] = None
    arrival_time: Optional[time] = None
    bus_type: Optional[str] = Field(None, pattern="^(普通|商务|豪华)$")
    total_seats: Optional[int] = Field(None, gt=0)
    available_seats: Optional[int] = Field(None, ge=0)
    price: Optional[Decimal] = Field(None, gt=0)
    operating_days: Optional[str] = Field(None, pattern=r"^\d(,\d)*$")
    is_active: Optional[bool] = None