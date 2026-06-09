from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Message


class MessageRepo:

    @staticmethod
    async def create(db: AsyncSession, message: Message):
        db.add(message)
        await db.flush()
        return message

    @staticmethod
    async def get_by_user(db: AsyncSession, user_id: str, limit: int = 50, offset: int = 0) -> list[Message]:
        sql = (select(Message)
               .where(Message.user_id == user_id)
               .order_by(Message.created_at.asc())
               .offset(offset)
               .limit(limit)
               )
        result = await db.execute(sql)
        return list(result.scalars().all())

    @staticmethod
    async def delete_by_user(db: AsyncSession, user_id: str) -> int:
        sql = delete(Message).where(Message.user_id == user_id)
        result = await db.execute(sql)
        await db.flush()
        return result.rowcount