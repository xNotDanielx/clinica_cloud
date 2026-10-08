import Feedback from "./Feedback";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Send, ShieldCheck, X } from "lucide-react";

import { apiFetch } from "./api";


type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantResponse = {
  answer: string;
  suggestions: string[];
};

const initialSuggestions = [
  "Resumen de citas por estado",
  "¿Cuántas citas están pendientes?",
  "Muéstrame la agenda de hoy",
];

export default function AdminAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hola. Puedo resumir la agenda y las citas pendientes sin exponer datos personales en el chat.",
    },
  ]);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages, isLoading, error]);

  const sendMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    const history = messages.slice(1).slice(-8);
    setMessages((current) => [
      ...current,
      { role: "user", content: cleanText },
    ]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = (await apiFetch("/asistente/admin/chat", {
        method: "POST",
        body: JSON.stringify({ message: cleanText, history }),
      })) as AssistantResponse;
      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.answer },
      ]);
      setSuggestions(response.suggestions);
    } catch {
      setError("No pude consultar la información administrativa.");
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
          aria-label="Asistente administrativo"
          className="fixed bottom-24 left-4 right-4 z-40 flex max-h-[min(620px,75vh)] flex-col overflow-hidden rounded-lg border border-violet-300/20 bg-[#0b1220] shadow-2xl shadow-black/50 sm:left-auto sm:right-24 sm:w-[390px]"
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-violet-400/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-400 text-slate-950">
                <Bot aria-hidden="true" size={21} />
              </div>
              <div>
                <p className="font-bold text-white">Asistente administrativo</p>
                <p className="flex items-center gap-1 text-xs text-slate-400">
                  <ShieldCheck aria-hidden="true" size={13} /> Sesión protegida
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar asistente administrativo"
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
                    ? "ml-auto bg-violet-400 font-medium text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                {message.content}
              </div>
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
                  className="shrink-0 rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-300/20 disabled:opacity-50"
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
                placeholder="Consulta la operación"
                aria-label="Consulta administrativa"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Enviar consulta administrativa"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-400 text-slate-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send aria-hidden="true" size={19} />
              </button>
            </form>
          </div>
        </aside>
      )}

      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          window.setTimeout(() => inputRef.current?.focus(), 0);
        }}
        aria-label={isOpen ? "Cerrar asistente administrativo" : "Abrir asistente administrativo"}
        title="Asistente administrativo"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-violet-400 text-slate-950 shadow-2xl shadow-black/40 transition hover:bg-violet-300"
      >
        {isOpen ? <X aria-hidden="true" size={24} /> : <ShieldCheck aria-hidden="true" size={25} />}
      </button>
    </>
  );
}
