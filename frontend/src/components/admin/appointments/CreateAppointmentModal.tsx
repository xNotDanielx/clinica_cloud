
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
    className="modal-backdrop"
    onClick={closeCreateAppointmentModal}
  >
    <div
      className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="modal-header">
        <div className="modal-heading-row">
          <div>
            <p className="modal-kicker">Citas</p>
            <h2 className="modal-title">Agregar cita</h2>
          </div>
          <button
            type="button"
            onClick={closeCreateAppointmentModal}
            className="modal-close-button"
          >
            ×
          </button>
        </div>
      </div>

      <form onSubmit={handleCreateAppointment} className="modal-body">
        <div className="form-grid">
          <div className="md:col-span-2">
            <label className="form-label">Paciente</label>
            <select
              name="id_paciente"
              value={createAppointmentForm.id_paciente}
              onChange={handleCreateAppointmentInputChange}
              className="form-control form-select"
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
            <label className="form-label">Fecha</label>
            <input
              type="date"
              name="fecha_programada"
              value={createAppointmentForm.fecha_programada}
              onChange={handleCreateAppointmentInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Estado</label>
            <select
              name="estado"
              value={createAppointmentForm.estado}
              onChange={handleCreateAppointmentInputChange}
              className="form-control form-select"
            >
              <option value="pendiente_aprobacion">Pendiente aprobación</option>
              <option value="aprobada">Aprobada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="form-label">Hora inicio</label>
            <input
              type="time"
              name="hora_inicio"
              value={createAppointmentForm.hora_inicio}
              onChange={handleCreateAppointmentInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Hora fin</label>
            <input
              type="time"
              name="hora_fin"
              value={createAppointmentForm.hora_fin}
              onChange={handleCreateAppointmentInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Valor consulta</label>
            <input
              type="number"
              step="0.01"
              name="valor_consulta"
              value={createAppointmentForm.valor_consulta}
              onChange={handleCreateAppointmentInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Código promocional</label>
            <input
              type="number"
              name="id_codigo_promocional"
              value={createAppointmentForm.id_codigo_promocional}
              onChange={handleCreateAppointmentInputChange}
              className="form-control"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Nota</label>
            <textarea
              name="nota"
              value={createAppointmentForm.nota}
              onChange={handleCreateAppointmentInputChange}
              rows={4}
              className="form-control"
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

        <div className="form-actions">
          <button
            type="submit"
            disabled={isCreatingAppointment}
            className="admin-submit-button"
          >
            {isCreatingAppointment ? "Guardando..." : "Guardar cita"}
          </button>
          <button
            type="button"
            onClick={closeCreateAppointmentModal}
            className="admin-cancel-button"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
