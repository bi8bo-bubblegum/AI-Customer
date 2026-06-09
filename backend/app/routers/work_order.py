from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.common.dependencies import get_current_user, require_admin
from app.common.response import success
from app.models.user import User
from app.schemas.work_order import UpdateWorkOrderRequest
from app.services.work_order_service import WorkOrderService

router = APIRouter(prefix="/api/work-orders", tags=["工单"])


@router.get("/")
async def get_work_orders(
    status: str = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    orders = await WorkOrderService.get_all(db, status, limit, offset)
    return success(data=[order.__dict__ for order in orders])


@router.get("/{order_id}")
async def get_work_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await WorkOrderService.get_by_id(db, order_id, current_user)
    return success(data=order.__dict__)


@router.put("/{order_id}")
async def update_work_order(
    order_id: str,
    req: UpdateWorkOrderRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    order = await WorkOrderService.update(db, order_id, **req.model_dump(exclude_none=True))
    return success(data=order.__dict__)