from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.dependencies import get_current_user
from app.common.response import success
from app.database import get_db
from app.models.user import User
from app.schemas.user import RegisterRequest, LoginRequest, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix='/api/auth', tags=['auth'])

@router.post('/register')
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    user = await AuthService.register(db, req)
    return success(data=user.model_dump(), message='注册成功')

@router.post('/login')
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    token = await AuthService.login(db, req)
    return success(data=token.model_dump(), message='登录成功')

@router.post('/refresh')
async def refresh(refresh_token: str, db: AsyncSession = Depends(get_db)):
    token = await AuthService.refresh(db, refresh_token)
    return success(data=token.model_dump(), message='刷新成功')

@router.get('/me')
async def me(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success(data=UserResponse.model_validate(current_user).model_dump())

