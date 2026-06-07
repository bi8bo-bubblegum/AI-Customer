from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import ValidationException
from app.models import User
from app.repositories.user_repo import UserRepo
from app.schemas.user import RegisterRequest, UserResponse, LoginRequest, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token


class AuthService:

    @staticmethod
    async def register(db: AsyncSession, req: RegisterRequest) -> UserResponse:
        existing = await UserRepo.get_by_username(db, req.username)
        if existing:
            raise ValidationException("用户名已存在")

        existing = await UserRepo.get_by_email(db, req.email)
        if existing:
            raise ValidationException("邮箱已存在")

        user = User(
            username=req.username,
            email=req.email,
            hashed_password=hash_password(req.password)
        )

        user = await UserRepo.create(db, user)
        return UserResponse.model_validate(user)

    @staticmethod
    async def login(db: AsyncSession, req: LoginRequest) -> TokenResponse:
        user = await UserRepo.get_by_username(db, req.username)
        if not user or not verify_password(req.password, user.hashed_password):
            raise ValidationException("用户名或密码错误")
        if not user.is_active:
            raise ValidationException("用户被禁用")
        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id))
        )

    @staticmethod
    async def refresh(db: AsyncSession, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if payload is None or payload.get("type") != "refresh":
            raise ValidationException("无效的刷新令牌")
        user_id = payload.get("sub")
        user = await UserRepo.get_by_id(db, user_id)
        if not user or not user.is_active:
            raise ValidationException("用户不存在或被禁用")

        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id))
        )
