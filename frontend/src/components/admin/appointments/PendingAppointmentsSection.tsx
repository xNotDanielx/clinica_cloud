
import type { Appointment } from "../../../types/appointment";

type PendingAppointmentsSectionProps = {
  authorizations: Appointment[];
  onApprove: (appointmentId: number) => void;
  onReject: (appointmentId: number) => void;
};

export default function PendingAppointmentsSection({
  authorizations,
  onApprove,
  onReject,
}: PendingAppointmentsSectionProps) {
  const autorizarCita = onApprove;
  const rechazarCita = onReject;

  return (
<section className="space-y-6">
  <div className="rounded-4xl border border-white/10 bg-cyan-500/5 p-6 shadow-2xl backdrop-blur-xl">
    <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Autorizar citas</p>
    <h2 className="mt-2 text-3xl font-black text-white">Revisa las citas pendientes</h2>
    <p className="mt-3 text-slate-300">
      Revisa las citas pendientes y autorízalas para que sean confirmadas.
    </p>
  </div>

  <div className="overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-2xl">
    <table className="min-w-full divide-y divide-white/10">
      <thead className="bg-slate-950/70 text-left text-sm uppercase tracking-[0.2em] text-slate-400">
        <tr>
          <th className="px-6 py-4">ID</th>
          <th className="px-6 py-4">Paciente</th>
          <th className="px-6 py-4">Fecha</th>
          <th className="px-6 py-4">Hora</th>
          <th className="px-6 py-4">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10 bg-slate-950/70 text-sm text-slate-200">
        {authorizations.map((item) => (
          <tr key={item.id}>
            <td className="px-6 py-4 font-semibold text-cyan-300">{item.id}</td>
            <td className="px-6 py-4">
              <div>
                <p className="font-medium text-white">{item.nombre_paciente || "Sin nombre"}</p>
                <p className="text-xs text-slate-400">{item.id_paciente}</p>
              </div>
            </td>
            <td className="px-6 py-4">{item.fecha_programada}</td>
            <td className="px-6 py-4">
              {item.hora_inicio} - {item.hora_fin}
            </td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => autorizarCita(item.id)}
                  className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20"
                >
                  Autorizar
                </button>
                <button
                  onClick={() => rechazarCita(item.id)}
                  className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                >
                  Rechazar
                </button>
              </div>
            </td>
          </tr>
        ))}
        {authorizations.length === 0 && (
          <tr>
            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
              No hay citas pendientes.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>
  );
}
