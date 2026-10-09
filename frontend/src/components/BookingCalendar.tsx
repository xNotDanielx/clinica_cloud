import Feedback from "./Feedback";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { apiFetch } from "./api";

type CalendarData = { mes: string; fecha_minima: string; fecha_maxima: string; zona_horaria: string; dias: Record<string, string[]> };
type Props = { date: string; hour: string; revision: number; onChange: (date: string, hour: string) => void; onHours: (hours: string[]) => void };

export default function BookingCalendar({ date, hour, revision, onChange, onHours }: Props) {
  const [month, setMonth] = useState(date ? date.slice(0, 7) + "-01" : "");
  const [resultData, setData] = useState<CalendarData | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const requestKey = `${month}:${revision}:${retry}`;
  const loading = loadedKey !== requestKey;
  const data = loading ? null : resultData;
  useEffect(() => {
    let current = true;
    apiFetch("/citas/calendario" + (month ? `?mes=${month}` : ""))
      .then(result => { if (current) {setData(result);setError("");} })
      .catch(() => { if (current) setError("No pudimos consultar la agenda. Intenta de nuevo."); })
      .finally(() => { if (current) setLoadedKey(requestKey); });
    return () => { current = false; };
  }, [month, requestKey]);
  useEffect(() => { onHours(data?.dias[date] ?? []); }, [data, date, onHours]);

  const visibleMonth = data?.mes || month;
  const first = visibleMonth ? new Date(visibleMonth + "T12:00:00") : null;
  const title = first ? new Intl.DateTimeFormat("es", { month: "long", year: "numeric" }).format(first) : "Agenda de valoración";
  const move = (direction: number) => {
    if (!first) return;
    const next = new Date(first.getFullYear(), first.getMonth() + direction, 1, 12);
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`);
    onChange("", "");
  };
  const hours = data?.dias[date] ?? [];
  return <section className="r-booking-calendar" aria-label="Calendario de valoración" aria-busy={loading}>
    <div className="r-calendar-heading"><h3>{title}</h3><div>
      <button type="button" title="Mes anterior" aria-label="Mes anterior" disabled={!data || loading || data.mes.slice(0, 7) <= data.fecha_minima.slice(0, 7)} onClick={() => move(-1)}><ChevronLeft size={18}/></button>
      <button type="button" title="Mes siguiente" aria-label="Mes siguiente" disabled={!data || loading || data.mes.slice(0, 7) >= data.fecha_maxima.slice(0, 7)} onClick={() => move(1)}><ChevronRight size={18}/></button>
    </div></div>
    {loading ? <p role="status">Consultando disponibilidad...</p> : error ? <Feedback title="Agenda no disponible"><p>{error}</p><div className="feedback-actions"><button type="button" onClick={() => setRetry(value => value + 1)}><RefreshCw size={16}/> Reintentar</button></div></Feedback> : data && <>
      <p className="r-calendar-policy">Valoración de 1 hora · Hora de Santiago de Chile. Solicitudes entre 2 y 90 días de anticipación.</p>
      <div className="r-calendar-grid" role="group" aria-label="Días disponibles">
        {["L", "M", "X", "J", "V", "S", "D"].map((label, index) => <span aria-hidden="true" key={index}>{label}</span>)}
        {Array.from({ length: first ? (first.getDay() + 6) % 7 : 0 }, (_, index) => <span key={"blank-" + index}/>)}
        {Object.entries(data.dias).map(([day, slots]) => <button type="button" key={day} disabled={!slots.length} aria-pressed={day === date}
          aria-label={`${day}: ${slots.length ? slots.length + " horarios disponibles" : "sin disponibilidad"}`}
          onClick={() => onChange(day, "")}><span>{Number(day.slice(-2))}</span>{slots.length > 0 && <small>{slots.length} libres</small>}</button>)}
      </div>
      {date ? <fieldset className="r-hour-options"><legend>Horarios del {date}</legend>
        {!hours.length && <Feedback tone="warning" title="Día sin disponibilidad">Elige otra fecha para continuar.</Feedback>}
        {hours.map(value => <label key={value}><input type="radio" name="booking-hour" checked={hour === value} onChange={() => onChange(date, value)}/><span>{value}</span></label>)}
      </fieldset> : <p>Selecciona un día disponible.</p>}
      <Feedback tone="info" title="Solicitud pendiente de aprobación">El horario queda apartado al enviar la solicitud. La atención solo se confirma cuando administración la aprueba.</Feedback>
    </>}
  </section>;
}
