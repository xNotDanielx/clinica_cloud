from typing import Literal

from pydantic import BaseModel, Field


class MensajeConversacion(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class ConsultaAsistente(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    history: list[MensajeConversacion] = Field(default_factory=list, max_length=10)


class AccionAsistente(BaseModel):
    type: Literal["open_booking"]
    label: str
    procedure_names: list[str] = Field(default_factory=list, max_length=2)
    date: str | None = None


class RespuestaAsistente(BaseModel):
    answer: str
    provider: str
    suggestions: list[str] = Field(default_factory=list)
    actions: list[AccionAsistente] = Field(default_factory=list)
