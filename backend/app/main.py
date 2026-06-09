from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.common.exception_handlers import generic_exception_handler, business_exception_handler, \
    validation_exception_handler
from app.common.exceptions import BusinessException
from app.config import settings
from app.database import engine
from app.routers import auth, chat, knowledge, work_order


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncPostgresSaver.from_conn_string(settings.CHECKPOINTER_DATABASE_URL) as checkpointer:
        await checkpointer.setup()
        app.state.checkpointer = checkpointer
        yield
    await engine.dispose()

app = FastAPI(
    title='AI-Customer 道路客运 AI 客服',
    description="基于 LangGraph 多智能体的道路客运 AI 客服系统",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_exception_handler(BusinessException, business_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# 注册路由
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(knowledge.router)
app.include_router(work_order.router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}