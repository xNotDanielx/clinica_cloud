
import type { ChangeEvent, FormEvent } from "react";
import type { CreateAppointmentFormData } from "../../../types/appointment";
import type { Patient } from "../../../types/patient";
import type { Procedure } from "../../../types/procedure";
import { formatCurrency } from "../../../utils/formatters";

type CreateAppointmentModalProps = {
  form: CreateAppointmentFormData;
  patients: Patient[];
  procedures: Procedure[];
  error: string;
  isSubmitting: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onToggleProcedure: (procedureId: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function CreateAppointmentModal({
  form,
  patients,
  procedures,
  error,
  isSubmitting,
  onChange,
  onToggleProcedure,
  onSubmit,
  onClose,
}: CreateAppointmentModalProps) {
  const createAppointmentForm = form;
  const createAppointmentError = error;
  const isCreatingAppointment = isSubmitting;
  const handleCreateAppointmentInputChange = onChange;
  const toggleCreateAppointmentProcedure = onToggleProcedure;
  const handleCreateAppointment = onSubmit;
  const closeCreateAppointmentModal = onClose;

  return (
<div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
    onClick={closeCreateAppointmentModal}
  >
    <div
      className="relative w-full max-w-4xl overflow-hidden rounded-4xl border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="border-b border-white/10 bg-white/5 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Citas</p>
            <h2 className="mt-2 text-2xl font-black text-white">Agregar cita</h2>
          </div>
          <button
            type="button"
            onClick={closeCreateAppointmentModal}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white transition hover:bg-white/20"
          >
            ×
          </button>
        </div>
      </div>

      <form onSubmit={handleCreateAppointment} className="max-h-[85vh] overflow-y-auto px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-200">Paciente</label>
            <select
              name="id_paciente"
              value={createAppointmentForm.id_paciente}
              onChange={handleCreateAppointmentInputChange}
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
              value={createAppointmentForm.fecha_programada}
              onChange={handleCreateAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Estado</label>
            <select
              name="estado"
              value={createAppointmentForm.estado}
              onChange={handleCreateAppointmentInputChange}
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
              value={createAppointmentForm.hora_inicio}
              onChange={handleCreateAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Hora fin</label>
            <input
              type="time"
              name="hora_fin"
              value={createAppointmentForm.hora_fin}
              onChange={handleCreateAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Valor consulta</label>
            <input
              type="number"
              step="0.01"
              name="valor_consulta"
              value={createAppointmentForm.valor_consulta}
              onChange={handleCreateAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Código promocional</label>
            <input
              type="number"
              name="id_codigo_promocional"
              value={createAppointmentForm.id_codigo_promocional}
              onChange={handleCreateAppointmentInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-200">Nota</label>
            <textarea
              name="nota"
              value={createAppointmentForm.nota}
              onChange={handleCreateAppointmentInputChange}
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
                    checked={createAppointmentForm.procedimiento_ids.includes(procedure.id)}
                    onChange={() => toggleCreateAppointmentProcedure(procedure.id)}
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

        {createAppointmentError && (
          <p className="mt-4 text-sm text-rose-300">{createAppointmentError}</p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isCreatingAppointment}
            className="w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingAppointment ? "Guardando..." : "Guardar cita"}
          </button>
          <button
            type="button"
            onClick={closeCreateAppointmentModal}
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
