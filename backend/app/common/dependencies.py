from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import AuthException, ForbiddenException
from app.database import get_db
from app.models import User
from app.repositories.user_repo import UserRepo
from app.utils.security import decode_token

security = HTTPBearer()

async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise AuthException('Token 无效')
    user_id = payload.get('sub')
    if not user_id:
        raise AuthException('Token 无效')
    user = await UserRepo.get_by_id(db, user_id)
    if user is None:
        raise AuthException('用户不存在')
    if not user.is_active:
        raise AuthException('用户被禁用')
    return user

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise ForbiddenException("需要管理员权限")
    return current_user
