import uuid
from datetime import datetime

from sqlalchemy import Uuid, String, TEXT, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Message(Base):
    __tablename__ = 'messages'

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False) # user | assistant | system
    content: Mapped[str] = mapped_column(TEXT, nullable=False)
    agent_type: Mapped[str] = mapped_column(String(20), nullable=True) # router | ticket | service | complaint | genera
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())