from fastapi import Request
from fastapi.exceptions import RequestValidationError
from starlette.responses import JSONResponse

from app.common.exceptions import BusinessException
from app.common.response import error


async def business_exception_handler(request: Request, exc: BusinessException) -> JSONResponse:
    return JSONResponse(
        status_code=200,
        content=error(
            code=exc.code,
            message=exc.message
        )
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    detail = ';'.join([f"{'.'.join(str(l) for l in e['loc'])}: {e['msg']}" for e in errors])
    return JSONResponse(
        status_code=200,
        content=error(
            code=422,
            message=detail
        )
    )

async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=error(
            code=500,
            message="服务器内部错误"
        )
    )