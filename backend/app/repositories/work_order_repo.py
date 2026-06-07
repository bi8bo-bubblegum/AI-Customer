from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.work_order import WorkOrder


class WorkOrderRepo:
    @staticmethod
    async def create(db: AsyncSession, **kwargs) -> WorkOrder:
        order = WorkOrder(**kwargs)
        db.add(order)
        await db.refresh(order)
        return order

    @staticmethod
    async def get_all(db: AsyncSession, status: str = None, limit: int = 50, offset: int = 0) -> list[WorkOrder]:
        query = select(WorkOrder).order_by(WorkOrder.created_at.desc())
        if status:
            query = query.where(WorkOrder.status == status)
        result = await db.execute(query.offset(offset).limit(limit))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_user(db: AsyncSession, user_id: str) -> list[WorkOrder]:
        result = await db.execute(
            select(WorkOrder)
            .where(WorkOrder.user_id == user_id)
            .order_by(WorkOrder.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, order_id: str) -> WorkOrder | None:
        result = await db.execute(select(WorkOrder).where(WorkOrder.id == order_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update(db: AsyncSession, order_id: str, **kwargs) -> WorkOrder | None:
        order = await WorkOrderRepo.get_by_id(db, order_id)
        if order:
            for key, value in kwargs.items():
                if value is not None:
                    setattr(order, key, value)
            await db.refresh(order)
        return order