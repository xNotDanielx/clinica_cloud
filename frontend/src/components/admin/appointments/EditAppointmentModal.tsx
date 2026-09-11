
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
    className="modal-backdrop"
    onClick={closeEditAppointmentModal}
  >
    <div
      className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="modal-header">
        <div className="modal-heading-row">
          <div>
            <p className="modal-kicker">Citas</p>
            <h2 className="modal-title">Editar cita</h2>
          </div>
          <button
            type="button"
            onClick={closeEditAppointmentModal}
            className="modal-close-button"
          >
            ×
          </button>
        </div>
      </div>

      <form onSubmit={handleEditAppointment} className="modal-body">
        <div className="form-grid">
          <div className="md:col-span-2">
            <label className="form-label">Paciente</label>
            <select
              name="id_paciente"
              value={editAppointmentForm.id_paciente}
              onChange={handleEditAppointmentInputChange}
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
              value={editAppointmentForm.fecha_programada}
              onChange={handleEditAppointmentInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Estado</label>
            <select
              name="estado"
              value={editAppointmentForm.estado}
              onChange={handleEditAppointmentInputChange}
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
              value={editAppointmentForm.hora_inicio}
              onChange={handleEditAppointmentInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Hora fin</label>
            <input
              type="time"
              name="hora_fin"
              value={editAppointmentForm.hora_fin}
              onChange={handleEditAppointmentInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Valor consulta</label>
            <input
              type="number"
              step="0.01"
              name="valor_consulta"
              value={editAppointmentForm.valor_consulta}
              onChange={handleEditAppointmentInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Código promocional</label>
            <input
              type="number"
              name="id_codigo_promocional"
              value={editAppointmentForm.id_codigo_promocional}
              onChange={handleEditAppointmentInputChange}
              className="form-control"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Nota</label>
            <textarea
              name="nota"
              value={editAppointmentForm.nota}
              onChange={handleEditAppointmentInputChange}
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

        <div className="form-actions">
          <button
            type="submit"
            disabled={isEditingAppointment}
            className="admin-submit-button"
          >
            {isEditingAppointment ? "Guardando..." : "Actualizar cita"}
          </button>
          <button
            type="button"
            onClick={closeEditAppointmentModal}
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
