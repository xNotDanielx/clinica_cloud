import { useState } from "react";
import { Search, RefreshCw, Copy, Check } from "lucide-react";
import Feedback from "./Feedback";
import { apiFetch, ApiError, apiErrorMessage } from "./api";

type Status = { estado: string; fecha_programada: string; hora_inicio: string; zona_horaria: string };
const states: Record<string, { title: string; description: string; tone: "info" | "success" | "warning" }> = {
  pendiente_aprobacion: { title: "En revisión", description: "Recibimos tu solicitud y apartamos el horario. Administración todavía debe confirmar la atención.", tone: "info" },
  aprobada: { title: "Cita confirmada", description: "Administración aprobó tu solicitud. Te esperamos en la fecha y hora indicadas.", tone: "success" },
  cancelada: { title: "Solicitud no vigente", description: "La solicitud fue rechazada o cancelada. El horario ya no está apartado. Puedes contactar con la clínica o enviar una nueva solicitud.", tone: "warning" },
  completada: { title: "Atención completada", description: "La clínica registró la atención como completada.", tone: "success" },
};

export function TrackingCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setError(""); }
    catch { setError("No se pudo copiar automáticamente. El código permanece visible para seleccionarlo."); }
  }
  return <div className="r-tracking-code">
    <h3>Código privado de seguimiento</h3><code>{code}</code>
    <button type="button" className="r-button r-button-outline" onClick={copy}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Código copiado" : "Copiar código"}</button>
    <p>Conserva este código: permite consultar el estado en “Mi solicitud”. No lo compartas. Si lo pierdes, contacta directamente con la clínica.</p>
    {error && <Feedback tone="warning">{error}</Feedback>}
  </div>;
}

export default function RequestTracking() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setStatus(null);
    setError("");
    if (!/^[A-Za-z0-9_-]{43}$/.test(code.trim())) {
      setError("Introduce el código privado completo que recibiste al enviar la solicitud. El número de cita no es suficiente.");
      return;
    }
    setLoading(true);
    try {
      setStatus(await apiFetch("/citas/seguimiento", { method: "POST", body: JSON.stringify({ codigo: code.trim() }) }));
    } catch (err) {
      setError(err instanceof ApiError && err.status === 404 ? "No encontramos una solicitud con ese código. Revísalo o contacta con la clínica." : apiErrorMessage(err, "No se pudo consultar el estado. Inténtalo de nuevo."));
    } finally { setLoading(false); }
  }
  const detail = status ? states[status.estado] : undefined;
  return <section id="mi-solicitud" className="r-section r-tracking" aria-labelledby="tracking-title">
    <div><p className="r-eyebrow">DESPUÉS DE SOLICITAR TU VALORACIÓN</p><h2 id="tracking-title">Mi solicitud</h2><p>Consulta la respuesta de la clínica con tu código privado.</p></div>
    <div>
      <form onSubmit={submit} noValidate aria-busy={loading}>
        <label htmlFor="tracking-code">Código de seguimiento</label>
        <div className="r-tracking-input"><input id="tracking-code" value={code} disabled={loading} autoComplete="off" spellCheck={false} maxLength={80}
          aria-invalid={!!error} aria-describedby={error ? "tracking-error" : "tracking-privacy"}
          onChange={event => {setCode(event.target.value);setError("");setStatus(null);}}/>
          <button className="r-button" disabled={loading}>{loading ? <RefreshCw size={17}/> : <Search size={17}/>} {loading ? "Consultando..." : "Consultar"}</button></div>
        <p id="tracking-privacy">No necesitas introducir tu documento ni tus datos médicos.</p>
      </form>
      {error && <Feedback id="tracking-error" title="No se pudo consultar">{error}</Feedback>}
      {status && detail && <div className="r-tracking-result"><Feedback tone={detail.tone} title={detail.title}>{detail.description}</Feedback>
        <dl><div><dt>Fecha</dt><dd>{new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(new Date(status.fecha_programada + "T12:00:00"))}</dd></div>
          <div><dt>Hora de Santiago de Chile</dt><dd>{status.hora_inicio.slice(0, 5)}</dd></div></dl>
      </div>}
    </div>
  </section>;
}
