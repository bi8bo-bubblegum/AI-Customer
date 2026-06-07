class BusinessException(Exception):
    def __init__(self, code: int = -1, message: str = '业务异常'):
        self.code = code
        self.message = message
        super().__init__(message)

class AuthException(BusinessException):
    def __init__(self, message: str = '认证失败'):
        super().__init__(code=401, message=message)

class ForbiddenException(BusinessException):
    def __init__(self, message: str = '无权限'):
        super().__init__(code=403, message=message)

class NotFoundException(BusinessException):
    def __init__(self, message: str = '未找到'):
        super().__init__(code=404, message=message)

class ValidationException(BusinessException):
    def __init__(self, message: str = '参数验证失败'):
        super().__init__(code=422, message=message)