from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.work_order_repo import WorkOrderRepo
from app.common.exceptions import NotFoundException, ForbiddenException
from app.models.user import User


class WorkOrderService:
    @staticmethod
    async def create_work_order(db: AsyncSession, user_id: str, title: str, description: str, category: str) -> dict:
        order = await WorkOrderRepo.create(
            db,
            user_id=user_id,
            title=title,
            description=description,
            category=category,
        )
        return {"id": order.id, "title": order.title, "status": order.status}

    @staticmethod
    async def get_all(db: AsyncSession, status: str = None, limit: int = 50, offset: int = 0):
        return await WorkOrderRepo.get_all(db, status, limit, offset)

    @staticmethod
    async def get_by_id(db: AsyncSession, order_id: str, current_user: User):
        order = await WorkOrderRepo.get_by_id(db, order_id)
        if not order:
            raise NotFoundException("工单不存在")
        if current_user.role != "admin" and order.user_id != current_user.id:
            raise ForbiddenException("无权查看此工单")
        return order

    @staticmethod
    async def update(db: AsyncSession, order_id: str, **kwargs):
        order = await WorkOrderRepo.update(db, order_id, **kwargs)
        if not order:
            raise NotFoundException("工单不存在")
        return order