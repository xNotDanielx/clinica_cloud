import Feedback from "./Feedback";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, RefreshCw, Users, CheckCircle2 } from "lucide-react";
import { apiFetch } from "./api";

type Appointment = { id: number; fecha_programada: string; hora_inicio: string; nombre_paciente?: string; estado: string };
type Props = { onPending: () => void; onAppointments: () => void; onCreate: () => void };
function localDate() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; }
const labels: Record<string, string> = { pendiente_aprobacion: "Pendiente", aprobada: "Aprobada", cancelada: "Cancelada", completada: "Completada" };

export default function AdminOverview({ onPending, onAppointments, onCreate }: Props) {
  const [data, setData] = useState<{ appointments: Appointment[]; pending: Appointment[]; patients: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [day, setDay] = useState(localDate);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([apiFetch("/citas/todas"), apiFetch("/citas/pendientes-aprobacion"), apiFetch("/pacientes")])
      .then(([appointments, pending, patients]) => { if (active) setData({ appointments, pending, patients: patients.length }); })
      .catch(() => { if (active) setError("No se pudo actualizar el resumen. Comprueba tu sesión e intenta de nuevo."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  const all = [...(data?.appointments ?? []), ...(data?.pending ?? [])];
  const agenda = all.filter(a => a.fecha_programada === day && a.estado !== "cancelada").sort((a,b) => a.hora_inicio.localeCompare(b.hora_inicio));
  const pending = [...(data?.pending ?? [])].sort((a,b) => `${a.fecha_programada}${a.hora_inicio}`.localeCompare(`${b.fecha_programada}${b.hora_inicio}`));
  const metrics = [
    { label: "Citas de hoy", value: all.filter(a => a.fecha_programada === localDate() && a.estado !== "cancelada").length, icon: CalendarDays, tone: "green" },
    { label: "Por aprobar", value: pending.length, icon: Clock3, tone: "coral" },
    { label: "Pacientes activos", value: data?.patients ?? 0, icon: Users, tone: "blue" },
    { label: "Citas aprobadas", value: all.filter(a => a.estado === "aprobada").length, icon: CheckCircle2, tone: "green" },
  ];
  return <div className="a-overview">
    <div className="a-title-row"><div><span className="a-kicker">OPERACIÓN DE LA CLÍNICA</span><h1>Todo listo para tu jornada.</h1><p>{new Intl.DateTimeFormat("es", {dateStyle:"full"}).format(new Date())}</p></div><div className="a-actions"><button className="a-icon" title="Actualizar resumen" aria-label="Actualizar resumen" onClick={() => setRevision(v=>v+1)} disabled={loading}><RefreshCw size={17} /></button><button className="a-primary" onClick={onCreate}><CalendarDays size={17}/> Nueva cita</button></div></div>
    {error && <Feedback>{error}</Feedback>}
    <div className="a-metrics" aria-busy={loading}>{metrics.map(({label,value,icon:Icon,tone})=><div key={label}><span className={`a-metric-icon ${tone}`}><Icon size={19}/></span><span>{label}</span><strong>{loading || error ? "—" : value}</strong></div>)}</div>
    <div className="a-overview-grid">
      <section className="a-agenda"><div className="a-block-title"><h2>Agenda del día</h2><input aria-label="Fecha de la agenda" type="date" value={day} onChange={e=>setDay(e.target.value)} /></div>
        {loading ? <p className="a-empty" role="status">Cargando agenda...</p> : error ? <p className="a-empty">Agenda no disponible.</p> : agenda.length ? <div className="a-agenda-list">{agenda.map(a=><div key={a.id}><time>{a.hora_inicio.slice(0,5)}</time><div><strong>{a.nombre_paciente || `Cita #${a.id}`}</strong><small>Solicitud #{a.id}</small></div><span className={`a-status ${a.estado}`}>{labels[a.estado] || a.estado}</span></div>)}</div> : <div className="a-empty"><CalendarDays size={32}/><h3>Un espacio libre en la agenda</h3><p>No hay citas activas para esta fecha.</p><button onClick={onCreate}>Crear una cita <ArrowRight size={15}/></button></div>}
        <button className="a-text-link" onClick={onAppointments}>Ver todas las citas <ArrowRight size={15}/></button>
      </section>
      <section className="a-pending"><div className="a-block-title"><h2>Solicitudes pendientes</h2><span className="a-count">{loading || error ? "—" : pending.length}</span></div>
        {loading ? <p className="a-empty">Cargando solicitudes...</p> : error ? <p className="a-empty">Solicitudes no disponibles.</p> : pending.length ? <div className="a-pending-list">{pending.slice(0,5).map(a=><div key={a.id}><span className="a-request-id">#{a.id}</span><div><strong>{a.nombre_paciente || "Solicitud de valoración"}</strong><small>{new Intl.DateTimeFormat("es",{day:"numeric",month:"short"}).format(new Date(`${a.fecha_programada}T12:00:00`))} · {a.hora_inicio.slice(0,5)}</small></div></div>)}</div> : <div className="a-empty"><CheckCircle2 size={32}/><h3>Todo al día</h3><p>No hay solicitudes por aprobar.</p></div>}
        <button className="a-text-link" onClick={onPending}>Revisar solicitudes <ArrowRight size={15}/></button>
      </section>
    </div>
  </div>;
}
