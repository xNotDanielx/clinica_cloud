
import type { Appointment } from "../../../types/appointment";
import { formatCurrency } from "../../../utils/formatters";

const statusClasses = {
  pendiente_aprobacion: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  aprobada: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  cancelada: "bg-red-500/10 text-red-300 border-red-500/20",
  Pendiente: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  Confirmada: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Cancelada: "bg-red-500/10 text-red-300 border-red-500/20",
};

type AppointmentsSectionProps = {
  appointmentQuery: string;
  appointments: Appointment[];
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: number) => void;
};

export default function AppointmentsSection({
  appointmentQuery,
  appointments,
  onQueryChange,
  onCreate,
  onEdit,
  onDelete,
}: AppointmentsSectionProps) {
  const setAppointmentQuery = onQueryChange;
  const openCreateAppointmentModal = onCreate;
  const openEditAppointmentModal = onEdit;
  const eliminarCita = onDelete;

  return (
<section className="space-y-6">
  <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Citas</p>
      <h2 className="mt-2 text-3xl font-black text-white">Agenda de citas</h2>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder="Buscar cita..."
        value={appointmentQuery}
        onChange={(event) => setAppointmentQuery(event.target.value)}
        className="w-full min-w-[220px] rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
      />
      <button
        className="whitespace-nowrap rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400"
        onClick={openCreateAppointmentModal}
      >
        Agregar cita
      </button>
    </div>
  </div>

  <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
    <table className="min-w-full divide-y divide-white/10">
      <thead className="bg-slate-950/70 text-left text-sm uppercase tracking-[0.2em] text-slate-400">
        <tr>
          <th className="px-6 py-4">ID</th>
          <th className="px-6 py-4">Paciente</th>
          <th className="px-6 py-4">Fecha</th>
          <th className="px-6 py-4">Hora</th>
          <th className="px-6 py-4">Monto final</th>
          <th className="px-6 py-4">Estado</th>
          <th className="px-6 py-4">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10 bg-slate-950/70 text-sm text-slate-200">
        {appointments.map((appointment) => (
          <tr key={appointment.id}>
            <td className="px-6 py-4 font-semibold text-cyan-300">{appointment.id}</td>
            <td className="px-6 py-4">
              <div>
                <p className="font-medium text-white">{appointment.nombre_paciente || "Sin nombre"}</p>
                <p className="text-xs text-slate-400">{appointment.id_paciente}</p>
              </div>
            </td>
            <td className="px-6 py-4">{appointment.fecha_programada}</td>
            <td className="px-6 py-4">
              {appointment.hora_inicio} - {appointment.hora_fin}
            </td>
            <td className="px-6 py-4">{formatCurrency(appointment.monto_final)}</td>
            <td className="px-6 py-4">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                  statusClasses[appointment.estado as keyof typeof statusClasses] ||
                  "bg-gray-500/10 text-gray-300 border-gray-500/20"
                }`}
              >
                {appointment.estado}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button
                  className="rounded-2xl bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-200 hover:bg-violet-500/20"
                  onClick={() => openEditAppointmentModal(appointment)}
                >
                  Editar
                </button>
                <button
                  className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                  onClick={() => eliminarCita(appointment.id)}
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
        {appointments.length === 0 && (
          <tr>
            <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
              No hay citas para mostrar.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>
  );
}
