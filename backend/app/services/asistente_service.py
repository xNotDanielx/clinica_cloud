import re
import unicodedata
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Protocol

from app.core.config import get_settings

from app.schemas.asistente import AccionAsistente, MensajeConversacion, RespuestaAsistente

settings = get_settings()


SYSTEM_PROMPT = """Eres el asistente informativo de Clínica Renacer.
Responde en español, de forma breve, clara y amable. Usa únicamente la información
de la clínica y los procedimientos suministrados en el contexto. No diagnostiques,
no prometas resultados y no sustituyas una valoración médica. No solicites datos
clínicos sensibles. Si una pregunta requiere criterio médico, invita a agendar una
valoración profesional. Nunca confirmes una cita: solo explica cómo solicitarla.
"""


@dataclass(frozen=True)
class ProcedimientoContexto:
    nombre: str
    descripcion: str


class ProveedorAsistente(Protocol):
    name: str

    def responder(
        self,
        message: str,
        history: list[MensajeConversacion],
        procedures: list[ProcedimientoContexto],
        requested_date: date | None,
        available_hours: list[str] | None,
    ) -> str: ...


class ProveedorLocal:
    name = "local"

    def responder(
        self,
        message: str,
        history: list[MensajeConversacion],
        procedures: list[ProcedimientoContexto],
        requested_date: date | None = None,
        available_hours: list[str] | None = None,
    ) -> str:
        del history
        normalized = AsistenteService.normalizar(message)

        if any(
            term in normalized
            for term in (
                "citas registradas",
                "datos personales",
                "documento de",
                "historial",
                "pacientes",
            )
        ):
            return (
                "No tengo acceso a datos de pacientes, citas existentes ni información "
                "administrativa. Solo puedo consultar información pública y horarios libres."
            )

        if any(word in normalized for word in ("riesgo", "dolor", "recuperacion", "diagnostico")):
            return (
                "Esa respuesta depende de tu situación y requiere valoración profesional. "
                "Puedo orientarte para solicitar una consulta, pero no reemplazo la evaluación médica."
            )

        if AsistenteService.es_intencion_cita(normalized) and requested_date:
            minimum_date = date.today() + timedelta(days=2)
            if requested_date < minimum_date:
                return (
                    f"Las solicitudes se reciben desde el {minimum_date.strftime('%d/%m/%Y')}. "
                    "Indícame una fecha posterior para consultar los horarios reales."
                )
            if available_hours:
                hours = ", ".join(available_hours)
                return (
                    f"Para el {requested_date.strftime('%d/%m/%Y')} están disponibles: {hours}. "
                    "Puedes abrir el formulario y enviar la solicitud; la clínica debe confirmarla."
                )
            return (
                f"No aparecen horarios disponibles para el {requested_date.strftime('%d/%m/%Y')}. "
                "Prueba con otra fecha."
            )

        if any(word in normalized for word in ("procedimiento", "servicio", "ofrecen", "realizan")):
            if not procedures:
                return "Ahora mismo no tengo disponible el catálogo. Puedes consultarlo en la sección de procedimientos."
            names = ", ".join(procedure.nombre for procedure in procedures)
            return (
                f"Los procedimientos activos son: {names}. "
                "La recomendación adecuada debe definirse en una valoración con el profesional."
            )

        if AsistenteService.es_intencion_cita(normalized):
            return (
                "Puedes seleccionar uno o dos procedimientos y pulsar 'Agendar consulta'. "
                "También puedo consultar horarios si escribes una fecha, por ejemplo 2026-10-15."
            )

        if any(
            word in normalized
            for word in ("ubicacion", "ubicad", "direccion", "contacto")
        ):
            return (
                "La clínica está en Hernando de Aguirre 128, Consultorio 805, Providencia, "
                "Santiago de Chile, cerca del Metro Tobalaba."
            )

        if any(word in normalized for word in ("precio", "valor", "cuanto", "costo")):
            return (
                "Los valores se confirman durante la consulta, porque pueden variar según la valoración, "
                "las características del procedimiento y las promociones vigentes."
            )

        if any(word in normalized for word in ("hola", "buenas", "buenos dias", "buenos días")):
            return "Hola. Puedo ayudarte con los procedimientos, el proceso para solicitar una cita y la ubicación de la clínica."

        return (
            "Puedo orientarte sobre procedimientos, solicitudes de cita, valores y ubicación. "
            "Para recomendaciones médicas personales es necesario agendar una valoración profesional."
        )


class ProveedorBedrock:
    name = "bedrock"

    def responder(
        self,
        message: str,
        history: list[MensajeConversacion],
        procedures: list[ProcedimientoContexto],
        requested_date: date | None = None,
        available_hours: list[str] | None = None,
    ) -> str:
        import boto3

        context = "\n".join(
            f"- {procedure.nombre}: {procedure.descripcion}" for procedure in procedures
        ) or "No hay procedimientos activos disponibles."
        messages: list[dict] = []
        for item in history:
            if not messages and item.role != "user":
                continue
            if messages and messages[-1]["role"] == item.role:
                messages[-1]["content"][0]["text"] += f"\n{item.content}"
            else:
                messages.append(
                    {"role": item.role, "content": [{"text": item.content}]}
                )

        availability_context = ""
        if requested_date is not None:
            hours = ", ".join(available_hours or []) or "sin horarios disponibles"
            availability_context = (
                f"\nDisponibilidad consultada para {requested_date.isoformat()}: {hours}."
            )
        current_message = (
            f"Procedimientos activos:\n{context}{availability_context}\n\nConsulta: {message}"
        )
        if messages and messages[-1]["role"] == "user":
            messages[-1]["content"][0]["text"] += f"\n{current_message}"
        else:
            messages.append({"role": "user", "content": [{"text": current_message}]})

        client = boto3.client("bedrock-runtime", region_name=settings.aws_region)
        response = client.converse(
            modelId=settings.bedrock_model_id,
            system=[{"text": SYSTEM_PROMPT}],
            messages=messages,
            inferenceConfig={"maxTokens": 350, "temperature": 0.2, "topP": 0.9},
        )
        return response["output"]["message"]["content"][0]["text"].strip()


class AsistenteService:
    @staticmethod
    def normalizar(value: str) -> str:
        decomposed = unicodedata.normalize("NFKD", value.casefold())
        return "".join(char for char in decomposed if not unicodedata.combining(char))

    @staticmethod
    def es_intencion_cita(message: str) -> bool:
        normalized = AsistenteService.normalizar(message)
        return any(
            word in normalized
            for word in ("cita", "agendar", "agenda", "horario", "disponib", "reserva")
        )

    @staticmethod
    def extraer_fecha(message: str, today: date | None = None) -> date | None:
        reference = today or date.today()
        normalized = AsistenteService.normalizar(message)
        if "pasado manana" in normalized:
            return reference + timedelta(days=2)
        if "manana" in normalized:
            return reference + timedelta(days=1)
        if re.search(r"\bhoy\b", normalized):
            return reference

        match = re.search(r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b", normalized)
        if match:
            values = tuple(int(value) for value in match.groups())
            try:
                return date(*values)
            except ValueError:
                return None

        match = re.search(r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b", normalized)
        if match:
            day, month, year = (int(value) for value in match.groups())
            try:
                return date(year, month, day)
            except ValueError:
                return None
        return None

    @staticmethod
    def detectar_procedimientos(
        message: str,
        procedures: list[ProcedimientoContexto],
    ) -> list[str]:
        normalized_message = AsistenteService.normalizar(message)
        matches: list[str] = []
        for procedure in procedures:
            normalized_name = AsistenteService.normalizar(procedure.nombre)
            significant_words = [
                word for word in normalized_name.split() if len(word) >= 5
            ]
            required_matches = 1 if len(significant_words) == 1 else 2
            score = sum(word in normalized_message for word in significant_words)
            includes_distinctive_name = bool(
                significant_words and significant_words[0] in normalized_message
            )
            if normalized_name in normalized_message or (
                includes_distinctive_name and score >= required_matches
            ):
                matches.append(procedure.nombre)
        return matches[:2]

    @staticmethod
    def sugerencias() -> list[str]:
        example_date = (date.today() + timedelta(days=2)).isoformat()
        return [
            "¿Qué procedimientos ofrecen?",
            f"¿Qué horarios hay para {example_date}?",
            "Quiero agendar una cita",
        ]

    @staticmethod
    def responder(
        message: str,
        history: list[MensajeConversacion],
        procedures: list[ProcedimientoContexto],
        requested_date: date | None = None,
        available_hours: list[str] | None = None,
    ) -> RespuestaAsistente:
        provider: ProveedorAsistente = ProveedorBedrock() if settings.ai_provider == "bedrock" else ProveedorLocal()
        try:
            answer = provider.responder(
                message,
                history,
                procedures,
                requested_date,
                available_hours,
            )
            provider_name = provider.name
        except Exception:
            if provider.name != "bedrock" or not settings.ai_fallback_to_local:
                raise
            fallback = ProveedorLocal()
            answer = fallback.responder(
                message,
                history,
                procedures,
                requested_date,
                available_hours,
            )
            provider_name = "local-fallback"

        actions: list[AccionAsistente] = []
        if AsistenteService.es_intencion_cita(message):
            matched_procedures = AsistenteService.detectar_procedimientos(
                message,
                procedures,
            )
            minimum_date = date.today() + timedelta(days=2)
            action_date = (
                requested_date.isoformat()
                if requested_date is not None and requested_date >= minimum_date
                else None
            )
            actions.append(
                AccionAsistente(
                    type="open_booking",
                    label="Abrir formulario de cita",
                    procedure_names=matched_procedures,
                    date=action_date,
                )
            )

        return RespuestaAsistente(
            answer=answer,
            provider=provider_name,
            suggestions=AsistenteService.sugerencias(),
            actions=actions,
        )
