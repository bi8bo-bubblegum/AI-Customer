from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    content: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    agent_type: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class ClearHistoryResponse(BaseModel):
    cleared: bool