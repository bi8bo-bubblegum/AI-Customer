from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User


class UserRepo:

    @staticmethod
    async def create(db: AsyncSession, user: User) -> User:
        db.add(user)
        await db.flush()
        return user

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: str) -> User | None:
        sql = select(User).where(User.id == user_id)
        result = await db.execute(sql)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_username(db: AsyncSession, username: str) -> User | None:
        sql = select(User).where(User.username == username)
        result = await db.execute(sql)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> User | None:
        sql = select(User).where(User.email == email)
        result = await db.execute(sql)
        return result.scalar_one_or_none()