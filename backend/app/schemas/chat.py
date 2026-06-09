import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    agent_type: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ClearHistoryResponse(BaseModel):
    cleared: bool


# SSE 事件
class SSETokenEvent(BaseModel):
    """流式 token 事件"""
    type: str = "token"
    content: str


class SSEToolCallEvent(BaseModel):
    """工具调用事件"""
    type: str = "tool_call"
    tool_name: str
    tool_args: dict


class SSEToolResultEvent(BaseModel):
    """工具执行结果事件"""
    type: str = "tool_result"
    tool_name: str
    result: str


class SSEDoneEvent(BaseModel):
    """对话完成事件"""
    type: str = "done"
    agent_type: str