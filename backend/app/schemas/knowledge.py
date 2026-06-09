import uuid
from datetime import datetime
from pydantic import BaseModel


class KnowledgeDocumentResponse(BaseModel):
    id: uuid.UUID
    title: str
    file_name: str
    file_path: str
    chunk_count: int
    uploaded_by: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
