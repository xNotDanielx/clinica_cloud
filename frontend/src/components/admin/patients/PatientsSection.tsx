
import type { Patient } from "../../../types/patient";

type PatientsSectionProps = {
  patientQuery: string;
  patients: Patient[];
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (patient: Patient) => void;
  onDelete: (identificacion: string) => void;
};

export default function PatientsSection({
  patientQuery,
  patients,
  onQueryChange,
  onCreate,
  onEdit,
  onDelete,
}: PatientsSectionProps) {
  const setPatientQuery = onQueryChange;
  const openCreatePatientModal = onCreate;
  const openEditPatientModal = onEdit;
  const eliminarPaciente = onDelete;

  return (
<section className="space-y-6">
  <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Pacientes</p>
      <h2 className="mt-2 text-3xl font-black text-white">Lista de pacientes</h2>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder="Buscar paciente..."
        value={patientQuery}
        onChange={(event) => setPatientQuery(event.target.value)}
        className="w-full min-w-[220px] rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
      />
      <button onClick={openCreatePatientModal} className="whitespace-nowrap rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400">
        Agregar paciente
      </button>
    </div>
  </div>

  <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
    <table className="min-w-full divide-y divide-white/10">
      <thead className="bg-slate-950/70 text-left text-sm uppercase tracking-[0.2em] text-slate-400">
        <tr>
          <th className="px-6 py-4">ID</th>
          <th className="px-6 py-4">Nombre</th>
          <th className="px-6 py-4">Teléfono</th>
          <th className="px-6 py-4">Correo</th>
          <th className="px-6 py-4">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10 bg-slate-950/70 text-sm text-slate-200">
        {patients.map((patient) => (
          <tr key={patient.identificacion}>
            <td className="px-6 py-4 font-semibold text-cyan-300">{patient.identificacion}</td>
            <td className="px-6 py-4">{patient.nombre_completo}</td>
            <td className="px-6 py-4">{patient.telefono}</td>
            <td className="px-6 py-4">{patient.email}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button
                  onClick={() => openEditPatientModal(patient)}
                  className="rounded-2xl bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarPaciente(patient.identificacion)}
                  className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
        {patients.length === 0 && (
          <tr>
            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
              No hay pacientes para mostrar.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>
  );
}
