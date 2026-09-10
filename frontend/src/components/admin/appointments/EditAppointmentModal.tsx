
import type { ChangeEvent, FormEvent } from "react";
import type { EditAppointmentFormData } from "../../../types/appointment";
import type { Patient } from "../../../types/patient";
import type { Procedure } from "../../../types/procedure";
import { formatCurrency } from "../../../utils/formatters";

type EditAppointmentModalProps = {
  form: EditAppointmentFormData;
  patients: Patient[];
  procedures: Procedure[];
  error: string;
  isSubmitting: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onToggleProcedure: (procedureId: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function EditAppointmentModal({
  form,
  patients,
  procedures,
  error,
  isSubmitting,
  onChange,
  onToggleProcedure,
  onSubmit,
  onClose,
}: EditAppointmentModalProps) {
  const editAppointmentForm = form;
  const editAppointmentError = error;
  const isEditingAppointment = isSubmitting;
  const handleEditAppointmentInputChange = onChange;
  const toggleEditAppointmentProcedure = onToggleProcedure;
  const handleEditAppointment = onSubmit;
  const closeEditAppointmentModal = onClose;

  return (
<div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
    onClick={closeEditAppointmentModal}
  >
    <div
      className="relative w-full max-w-4xl overflow-hidden rounded-4xl border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="border-b border-white/10 bg-white/5 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Citas</p>
            <h2 className="mt-2 text-2xl font-black text-white">Editar cita</h2>
          </div>
          <button
            type="button"
            onClick={closeEditAppointmentModal}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white transition hover:bg-white/20"
          >
            ×
          </button>
        </div>
      </div>

      <form onSubmit={handleEditAppointment} className="max-h-[85vh] overflow-y-auto px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-200">Paciente</label>
            <select
              name="id_paciente"
              value={editAppointmentForm.id_paciente}
              onChange={handleEditAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="">Selecciona un paciente</option>
              {patients.map((patient) => (
                <option key={patient.identificacion} value={patient.identificacion}>
                  {patient.nombre_completo} - {patient.identificacion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Fecha</label>
            <input
              type="date"
              name="fecha_programada"
              value={editAppointmentForm.fecha_programada}
              onChange={handleEditAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Estado</label>
            <select
              name="estado"
              value={editAppointmentForm.estado}
              onChange={handleEditAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="pendiente_aprobacion">Pendiente aprobación</option>
              <option value="aprobada">Aprobada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Hora inicio</label>
            <input
              type="time"
              name="hora_inicio"
              value={editAppointmentForm.hora_inicio}
              onChange={handleEditAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Hora fin</label>
            <input
              type="time"
              name="hora_fin"
              value={editAppointmentForm.hora_fin}
              onChange={handleEditAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Valor consulta</label>
            <input
              type="number"
              step="0.01"
              name="valor_consulta"
              value={editAppointmentForm.valor_consulta}
              onChange={handleEditAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Código promocional</label>
            <input
              type="number"
              name="id_codigo_promocional"
              value={editAppointmentForm.id_codigo_promocional}
              onChange={handleEditAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-200">Nota</label>
            <textarea
              name="nota"
              value={editAppointmentForm.nota}
              onChange={handleEditAppointmentInputChange}
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 block text-sm font-medium text-slate-200">Procedimientos</label>
            <div className="grid gap-3 md:grid-cols-2">
              {procedures.map((procedure) => (
                <label
                  key={procedure.id}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={editAppointmentForm.procedimiento_ids.includes(procedure.id)}
                    onChange={() => toggleEditAppointmentProcedure(procedure.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-white">{procedure.nombre}</p>
                    <p className="text-slate-400">{procedure.descripcion}</p>
                    <p className="mt-1 text-cyan-300">{formatCurrency(procedure.precio)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {editAppointmentError && (
          <p className="mt-4 text-sm text-rose-300">{editAppointmentError}</p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isEditingAppointment}
            className="w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEditingAppointment ? "Guardando..." : "Actualizar cita"}
          </button>
          <button
            type="button"
            onClick={closeEditAppointmentModal}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
