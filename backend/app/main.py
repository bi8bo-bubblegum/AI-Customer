from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError

from app.common.exception_handlers import generic_exception_handler, business_exception_handler, \
    validation_exception_handler
from app.common.exceptions import BusinessException
from app.database import engine
from app.routers import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
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

app.include_router(auth.router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}