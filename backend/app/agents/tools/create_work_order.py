from langchain_core.tools import tool, InjectedToolArg
from typing import Annotated
from app.database import async_session_factory
from app.services.work_order_service import WorkOrderService


@tool
async def create_work_order(
    title: str,
    description: str,
    category: str,
    user_id: Annotated[str, InjectedToolArg],
) -> str:
    """创建工单，用于投诉、理赔、建议等需要人工介入的场景。

    参数说明：
    - title: 工单标题，简短概括问题
    - description: 工单详细描述
    - category: 工单类别，必须为 complaint（投诉）、claim（理赔）、suggestion（建议）之一
    - user_id: 用户 ID（由系统自动注入，无需用户填写）

    当用户的问题需要人工客服处理时，调用此工具创建工单。
    """
    if category not in ("complaint", "claim", "suggestion"):
        return f"创建工单失败：无效的类别 '{category}'，必须为 complaint/claim/suggestion"

    async with async_session_factory() as db:
        result = await WorkOrderService.create_work_order(db, user_id, title, description, category)
        return (
            f"工单已创建成功！\n"
            f"工单编号：{result['id']}\n"
            f"标题：{result['title']}\n"
            f"状态：{result['status']}\n"
            f"我们的工作人员会尽快处理，请耐心等待。"
        )