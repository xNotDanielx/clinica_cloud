from fastapi import HTTPException

from app.common.exceptions import ConflictError, NotFoundError, UnauthorizedError, ValidationError


def to_http_exception(error: Exception) -> HTTPException:
    if isinstance(error, NotFoundError):
        return HTTPException(status_code=404, detail=str(error))
    if isinstance(error, ConflictError):
        return HTTPException(status_code=409, detail=str(error))
    if isinstance(error, UnauthorizedError):
        return HTTPException(status_code=401, detail=str(error))
    if isinstance(error, ValidationError):
        return HTTPException(status_code=422, detail=str(error))
    return HTTPException(status_code=500, detail="Error interno del servidor")
