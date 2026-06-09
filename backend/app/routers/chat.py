from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from app.database import get_db
from app.common.dependencies import get_current_user
from app.common.response import success
from app.models.user import User
from app.schemas.chat import ChatRequest
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api/chat", tags=["对话"])

@router.post("/send")
async def send_message(
    req: ChatRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    checkpointer: AsyncPostgresSaver = request.app.state.checkpointer
    return StreamingResponse(
        ChatService.stream_chat(db, checkpointer, current_user.id, req.content),
        media_type="text/event-stream",
    )

@router.get("/messages")
async def get_messages(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    messages = await ChatService.get_messages(db, current_user.id, limit, offset)
    return success(data=[msg.model_dump() for msg in messages])


@router.delete("/messages")
async def clear_history(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 清理聊天记录
    cleared = await ChatService.clear_history(db, current_user.id)
    # 同步清理 LangGraph checkpoint（上下文）
    checkpointer: AsyncPostgresSaver = request.app.state.checkpointer
    await ChatService.clear_checkpoint(checkpointer, str(current_user.id))
    return success(data={"cleared": cleared})

