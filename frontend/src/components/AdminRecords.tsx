import Feedback from "./Feedback";
import { ReactNode, useEffect, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Pencil, Plus, RefreshCw, Search, Trash2, Users, X } from "lucide-react";

export type Patient = {
  identificacion: string;
  tipo_identificacion: string;
  nombre_completo: string;
  telefono: string;
  email: string;
  direccion: string;
  sexo: string;
  nacionalidad?: string | null;
  genero?: string | null;
  fecha_nacimiento?: string | null;
  altura?: number | null;
  peso?: number | null;
  activo: boolean;
};

export type Appointment = {
  id: number;
  id_paciente: string;
  nombre_paciente?: string | null;
  id_codigo_promocional?: number | null;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin: string;
  monto_base?: string | number | null;
  monto_descuento?: string | number | null;
  monto_final?: string | number | null;
  nota?: string | null;
  notas_asesoria?: string | null;
  razon_rechazo?: string | null;
  estado: string;
  fecha_ultima_actualizacion?: string;
  procedimiento_ids?: number[];
};


export type ListState = { loading: boolean; error: string };
export const statusLabels: Record<string, string> = { pendiente_aprobacion: "Pendiente", aprobada: "Aprobada", cancelada: "Cancelada", completada: "Completada" };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function matches(values: unknown[], query: string) { return normalize(values.join(" ")).includes(normalize(query.trim())); }
function displayDate(value: string) { return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value + "T12:00:00")); }

function ListMessage({ state, empty, filtered, onRetry }: { state: ListState; empty: boolean; filtered: boolean; onRetry: () => void }) {
  if (state.loading) return <div className="a-list-message" role="status"><RefreshCw size={24} className="a-spin" /><h3>Cargando registros...</h3></div>;
  if (state.error) return <Feedback title="No se pudo cargar la lista"><p>{state.error}</p><div className="feedback-actions"><button onClick={onRetry}><RefreshCw size={15} /> Reintentar</button></div></Feedback>;
  if (empty) return <div className="a-list-message" role="status"><Search size={26}/><h3>{filtered ? "Sin coincidencias" : "Aún no hay registros"}</h3><p>{filtered ? "Prueba otro nombre, documento o filtro." : "Los registros aparecerán aquí cuando estén disponibles."}</p></div>;
  return null;
}
function Pager({ total, page, onPage }: { total: number; page: number; onPage: (value: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / 10));
  return <div className="a-pager"><span>{total ? (page - 1) * 10 + 1 : 0}–{Math.min(page * 10, total)} de {total}</span><div><button className="a-icon" aria-label="Página anterior" title="Página anterior" disabled={page === 1} onClick={() => onPage(page - 1)}><ChevronLeft size={17}/></button><span>{page} / {pages}</span><button className="a-icon" aria-label="Página siguiente" title="Página siguiente" disabled={page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={17}/></button></div></div>;
}
function RowAction({ label, onClick, danger = false, children }: { label: string; onClick: () => void; danger?: boolean; children: ReactNode }) {
  return <button className={danger ? "a-row-action danger" : "a-row-action"} title={label} aria-label={label} onClick={onClick}>{children}</button>;
}

type Shared = { state: ListState; onReload: () => void; onCreate: () => void };
export function PatientList({ patients, state, onReload, onCreate, onEdit, onDelete }: Shared & { patients: Patient[]; onEdit: (patient: Patient) => void; onDelete: (patient: Patient) => void }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = patients.filter(p => matches([p.nombre_completo, p.identificacion, p.telefono, p.email], query));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  const rows = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  return <section className="a-records">
    <div className="a-record-title"><div><span className="a-kicker">DIRECTORIO</span><h1>Pacientes</h1><p>Información de contacto y datos de cada paciente.</p></div><button className="a-primary" onClick={onCreate}><Plus size={17}/> Agregar paciente</button></div>
    <div className="a-list-toolbar"><label className="a-search"><Search size={17}/><input aria-label="Buscar pacientes" placeholder="Buscar por nombre, documento o contacto" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }}/>{query && <button title="Limpiar búsqueda" aria-label="Limpiar búsqueda" onClick={() => {setQuery("");setPage(1);}}><X size={16}/></button>}</label><button className="a-icon" aria-label="Actualizar pacientes" title="Actualizar pacientes" disabled={state.loading} onClick={onReload}><RefreshCw size={17}/></button></div>
    <div className="a-table-frame">
      <ListMessage state={state} empty={!filtered.length} filtered={!!query} onRetry={onReload}/>
      {!state.loading && !state.error && !!rows.length && <div className="a-table-scroll" role="region" aria-label="Lista de pacientes" tabIndex={0}><table className="a-record-table"><thead><tr><th>Paciente</th><th>Documento</th><th>Contacto</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{rows.map(p => <tr key={p.identificacion}><td><span className="a-person"><span className="a-avatar"><Users size={16}/></span><strong>{p.nombre_completo}</strong></span></td><td>{p.identificacion}</td><td><span>{p.email || "Sin correo"}</span><small>{p.telefono || "Sin teléfono"}</small></td><td><span className="a-status aprobada">Activo</span></td><td><div className="a-row-actions"><RowAction label={`Editar paciente ${p.nombre_completo}`} onClick={() => onEdit(p)}><Pencil size={16}/></RowAction><RowAction label={`Eliminar paciente ${p.nombre_completo}`} danger onClick={() => onDelete(p)}><Trash2 size={16}/></RowAction></div></td></tr>)}</tbody></table></div>}
      {!state.loading && !state.error && <Pager total={filtered.length} page={currentPage} onPage={setPage}/>}
    </div>
  </section>;
}

export function AppointmentList({ appointments, pending = false, state, onReload, onCreate, onEdit, onDelete, onApprove, onReject }: Shared & { appointments: Appointment[]; pending?: boolean; onEdit: (a: Appointment) => void; onDelete: (a: Appointment) => void; onApprove: (a: Appointment) => void; onReject: (a: Appointment) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [day, setDay] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [query, status, day]);
  const filtered = appointments.filter(a => matches([a.id, a.nombre_paciente, a.id_paciente], query) && (!status || a.estado === status) && (!day || a.fecha_programada === day)).sort((a,b) => `${a.fecha_programada}${a.hora_inicio}`.localeCompare(`${b.fecha_programada}${b.hora_inicio}`));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  const rows = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  return <section className="a-records">
    <div className="a-record-title"><div><span className="a-kicker">{pending ? "POR REVISAR" : "AGENDA"}</span><h1>{pending ? "Solicitudes" : "Citas"}</h1><p>{pending ? "Solicitudes de valoración pendientes de aprobación." : "Consulta y actualiza las citas de la clínica."}</p></div><button className="a-primary" onClick={onCreate}><Plus size={17}/> Agregar cita</button></div>
    <div className="a-list-toolbar"><label className="a-search"><Search size={17}/><input aria-label="Buscar citas" placeholder="Buscar paciente, documento o cita" value={query} onChange={e => setQuery(e.target.value)}/></label><label className="a-filter"><span>Fecha</span><input type="date" aria-label="Filtrar por fecha" value={day} onChange={e => setDay(e.target.value)}/></label>{!pending && <label className="a-filter"><span>Estado</span><select aria-label="Filtrar por estado" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos</option>{Object.entries(statusLabels).filter(([key]) => key !== "pendiente_aprobacion").map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>}<button className="a-icon" title="Actualizar citas" aria-label="Actualizar citas" disabled={state.loading} onClick={onReload}><RefreshCw size={17}/></button>{(query || status || day) && <button className="a-clear-filters" onClick={() => {setQuery("");setStatus("");setDay("");}}>Limpiar filtros</button>}</div>
    <div className="a-table-frame">
      <ListMessage state={state} empty={!filtered.length} filtered={!!(query || status || day)} onRetry={onReload}/>
      {!state.loading && !state.error && !!rows.length && <div className="a-table-scroll" role="region" aria-label={pending ? "Solicitudes pendientes" : "Lista de citas"} tabIndex={0}><table className="a-record-table"><thead><tr><th>Cita</th><th>Paciente</th><th>Fecha y horario</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{rows.map(a => <tr key={a.id}><td><span className="a-cita-id">#{a.id}</span></td><td><strong>{a.nombre_paciente || "Sin nombre"}</strong><small>{a.id_paciente}</small></td><td><span className="a-table-date"><CalendarDays size={14}/>{displayDate(a.fecha_programada)}</span><small>{a.hora_inicio.slice(0,5)} – {a.hora_fin.slice(0,5)}</small></td><td><span className={`a-status ${a.estado}`}>{statusLabels[a.estado] || a.estado}</span></td><td><div className="a-row-actions">{pending ? <><RowAction label={`Aprobar cita #${a.id}`} onClick={() => onApprove(a)}><Check size={17}/></RowAction><RowAction label={`Rechazar cita #${a.id}`} danger onClick={() => onReject(a)}><X size={17}/></RowAction></> : <><RowAction label={`Editar cita #${a.id}`} onClick={() => onEdit(a)}><Pencil size={16}/></RowAction><RowAction label={`Eliminar cita #${a.id}`} danger onClick={() => onDelete(a)}><Trash2 size={16}/></RowAction></>}</div></td></tr>)}</tbody></table></div>}
      {!state.loading && !state.error && <Pager total={filtered.length} page={currentPage} onPage={setPage}/>}
    </div>
  </section>;
}
