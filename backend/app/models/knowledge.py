import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import Uuid, String, Integer, DateTime, func, TEXT, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.config import settings
from app.database import Base


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    file_name: Mapped[str] = mapped_column(String(200), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    uploaded_by: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    content: Mapped[str] = mapped_column(TEXT, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    embedding = mapped_column(Vector(settings.EMBEDDING_DIMENSION))
    metadata_: Mapped[dict] = mapped_column('metadata', JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())