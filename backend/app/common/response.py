from typing import Optional, Any

from pydantic import BaseModel


class ResponseBase(BaseModel):
    code: int = 0
    message: str = 'success'
    data: Optional[Any] = None

def success(data: Any = None, message: str = 'success'):
    return ResponseBase(
        code=0,
        message=message,
        data=data
    ).model_dump()

def error(code: int = -1, message: str = 'error', data: Any = None):
    return ResponseBase(
        code=code,
        message=message,
        data=data
    ).model_dump()