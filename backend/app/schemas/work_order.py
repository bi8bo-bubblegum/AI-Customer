import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class WorkOrderResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str
    category: str
    status: str
    priority: str
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpdateWorkOrderRequest(BaseModel):
    status: Optional[str] = Field(None, pattern="^(pending|processing|resolved|closed)$")
    priority: Optional[str] = Field(None, pattern="^(low|normal|high|urgent)$")
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None