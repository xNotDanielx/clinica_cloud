import Feedback from "./Feedback";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, CalendarDays, MessageCircle, Send, X } from "lucide-react";

import { apiFetch } from "./api";


type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantResponse = {
  answer: string;
  provider: string;
  suggestions: string[];
  actions: AssistantAction[];
};

type AssistantAction = {
  type: "open_booking";
  label: string;
  procedure_names: string[];
  date: string | null;
};

type AssistantWidgetProps = {
  onStartBooking: (procedureNames: string[], date?: string | null) => void;
};

const initialMessage: ChatMessage = {
  role: "assistant",
  content: "Hola. Puedo consultar procedimientos y horarios reales, y ayudarte a preparar una solicitud de cita.",
};

const initialSuggestions = [
  "¿Qué procedimientos ofrecen?",
  `¿Qué horarios hay para ${getAssistantExampleDate()}?`,
  "¿Dónde están ubicados?",
];

function getAssistantExampleDate() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().slice(0, 10);
}

export default function AssistantWidget({ onStartBooking }: AssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [actions, setActions] = useState<AssistantAction[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages, actions, isLoading, error]);

  const open = () => {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const sendMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: cleanText };
    const history = messages.slice(1).slice(-8);
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setActions([]);
    setIsLoading(true);

    try {
      const response = (await apiFetch("/asistente/chat", {
        method: "POST",
        body: JSON.stringify({ message: cleanText, history }),
      })) as AssistantResponse;
      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.answer },
      ]);
      setSuggestions(response.suggestions);
      setActions(response.actions ?? []);
    } catch {
      setError("No pude responder en este momento. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      {isOpen && (
        <aside
          aria-label="Asistente virtual"
          className="fixed bottom-44 left-4 right-4 z-50 flex max-h-[min(620px,70vh)] flex-col overflow-hidden rounded-lg border border-white/15 bg-[#0b1220] shadow-2xl shadow-black/50 sm:bottom-24 sm:left-auto sm:right-24 sm:max-h-[min(620px,75vh)] sm:w-[380px]"
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-slate-950">
                <Bot aria-hidden="true" size={21} />
              </div>
              <div>
                <p className="font-bold text-white">Asistente Renacer</p>
                <p className="text-xs text-slate-400">Orientación informativa</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar asistente"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>

          <div
            className="chat-messages-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-auto bg-cyan-400 font-medium text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                {message.content}
              </div>
            ))}
            {actions.map((action, index) => (
              <button
                key={`${action.type}-${index}`}
                type="button"
                onClick={() => {
                  onStartBooking(action.procedure_names, action.date);
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/20"
              >
                <CalendarDays aria-hidden="true" size={18} />
                {action.label}
              </button>
            ))}
            {isLoading && (
              <div className="w-fit rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                Consultando...
              </div>
            )}
            {error && <Feedback>{error}</Feedback>}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="chat-suggestions mb-3 flex gap-2 overflow-x-auto pb-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendMessage(suggestion)}
                  disabled={isLoading}
                  className="shrink-0 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={1000}
                placeholder="Escribe tu pregunta"
                aria-label="Pregunta para el asistente"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Enviar pregunta"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send aria-hidden="true" size={19} />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              No reemplaza una valoración médica.
            </p>
          </div>
        </aside>
      )}

      <button
        type="button"
        onClick={isOpen ? () => setIsOpen(false) : open}
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente"}
        title={isOpen ? "Cerrar asistente" : "Asistente virtual"}
        className="fixed bottom-24 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-2xl shadow-black/40 transition hover:bg-cyan-300 sm:bottom-5 sm:right-24"
      >
        {isOpen ? <X aria-hidden="true" size={27} /> : <MessageCircle aria-hidden="true" size={28} />}
      </button>
    </>
  );
}
