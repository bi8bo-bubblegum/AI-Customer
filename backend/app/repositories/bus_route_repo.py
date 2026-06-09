from datetime import time

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import BusRoute, BusSchedule


class BusRouteRepo:

    @staticmethod
    async def create(db: AsyncSession, bus_route: BusRoute):
        db.add(bus_route)
        await db.flush()
        return bus_route

    @staticmethod
    async def get_all(db: AsyncSession, active_only: bool = True) -> list[BusRoute]:
        query = select(BusRoute)
        if active_only:
            query = query.where(BusRoute.is_active == True)
        result = await db.execute(query.order_by(BusRoute.route_name))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, route_id: str) -> BusRoute | None:
        result = await db.execute(
            select(BusRoute)
            .where(BusRoute.id == route_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def search_routes(db: AsyncSession, departure: str = None, arrival: str = None) -> list[BusRoute]:
        query = select(BusRoute).where(BusRoute.is_active == True)
        if departure:
            query = query.where(BusRoute.departure_station.ilike(f'%{departure}%'))
        if arrival:
            query = query.where(BusRoute.arrival_station.ilike(f'%{arrival}%'))
        result = await db.execute(query.order_by(BusRoute.route_name))
        return list(result.scalars().all())

class BusScheduleRepo:

    @staticmethod
    async def create(db: AsyncSession, bus_schedule: BusSchedule):
        db.add(bus_schedule)
        await db.flush()
        return bus_schedule

    @staticmethod
    async def get_by_route_id(db: AsyncSession, route_id: str, active_only: bool = True) -> list[BusSchedule]:
        query = select(BusSchedule).where(BusSchedule.route_id == route_id)
        if active_only:
            query = query.where(BusSchedule.is_active == True)
        result = await db.execute(query.order_by(BusSchedule.departure_time))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, schedule_id: str) -> BusSchedule | None:
        result = await db.execute(
            select(BusSchedule)
            .where(BusSchedule.id == schedule_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def search_schedules(
        db: AsyncSession,
        route_id: str = None,
        weekday: int = None,
        time_after: str = None,
        time_before: str = None,
        active_only: bool = True
    ) -> list[BusSchedule]:
        query = select(BusSchedule)
        if active_only:
            query = query.where(BusSchedule.is_active == True)

        if route_id:
            query = query.where(BusSchedule.route_id == route_id)

        if weekday is not None:
            query = query.where(BusSchedule.operating_days.contains(str(weekday)))

        if time_after:
            t = time.fromisoformat(time_after)
            query = query.where(BusSchedule.departure_time >= t)
        if time_before:
            t = time.fromisoformat(time_before)
            query = query.where(BusSchedule.departure_time <= t)

        result = await db.execute(query.order_by(BusSchedule.departure_time))
        return list(result.scalars().all())

    @staticmethod
    async def update(db: AsyncSession, data: BusSchedule) -> BusSchedule | None:
        schedule = await BusScheduleRepo.get_by_id(db, data.id)
        if schedule:
            schedule.bus_type = data.bus_type
            schedule.total_seats = data.total_seats
            schedule.available_seats = data.available_seats
            schedule.price = data.price
            schedule.operating_days = data.operating_days
            schedule.is_active = data.is_active
            await db.flush()
        return schedule


