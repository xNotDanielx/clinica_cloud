
import type { ChangeEvent, FormEvent } from "react";
import type { EditPatientFormData } from "../../../types/patient";

type EditPatientModalProps = {
  patientId: string | null;
  form: EditPatientFormData;
  error: string;
  isSubmitting: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function EditPatientModal({
  patientId,
  form,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: EditPatientModalProps) {
  const selectedPatientId = patientId;
  const editPatientForm = form;
  const editPatientError = error;
  const isEditingPatient = isSubmitting;
  const handleEditPatientInputChange = onChange;
  const handleEditPatient = onSubmit;
  const closeEditPatientModal = onClose;

  return (
<div
    className="modal-backdrop"
    onClick={closeEditPatientModal}
  >
    <div
      className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="modal-header">
        <div className="modal-heading-row">
          <div>
            <p className="modal-kicker">Pacientes</p>
            <h2 className="modal-title">Editar paciente</h2>
            <p className="mt-2 text-sm text-slate-300">
              Actualiza la información completa del paciente seleccionado.
            </p>
          </div>
          <button
            type="button"
            onClick={closeEditPatientModal}
            className="modal-close-button"
          >
            ×
          </button>
        </div>
      </div>

      <form onSubmit={handleEditPatient} className="modal-body">
        <div className="form-grid">
          <div className="md:col-span-2">
            <label className="form-label">Identificación</label>
            <input
              value={selectedPatientId ?? ""}
              disabled
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="form-label">Tipo de identificación</label>
            <select
              name="tipo_identificacion"
              value={editPatientForm.tipo_identificacion}
              onChange={handleEditPatientInputChange}
              className="form-control form-select"
            >
              <option value="cedula_chilena">Cédula chilena</option>
              <option value="cedula_extranjero">Cédula extranjero</option>
              <option value="pasaporte_chileno">Pasaporte chileno</option>
              <option value="pasaporte_extranjero">Pasaporte extranjero</option>
              <option value="documento_extranjero">Documento extranjero</option>
            </select>
          </div>

          <div>
            <label className="form-label">Sexo</label>
            <select
              name="sexo"
              value={editPatientForm.sexo}
              onChange={handleEditPatientInputChange}
              className="form-control form-select"
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Nombre completo</label>
            <input
              name="nombre_completo"
              value={editPatientForm.nombre_completo}
              onChange={handleEditPatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Teléfono</label>
            <input
              name="telefono"
              value={editPatientForm.telefono}
              onChange={handleEditPatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              value={editPatientForm.email}
              onChange={handleEditPatientInputChange}
              className="form-control"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Dirección</label>
            <input
              name="direccion"
              value={editPatientForm.direccion}
              onChange={handleEditPatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Nacionalidad</label>
            <input
              name="nacionalidad"
              value={editPatientForm.nacionalidad}
              onChange={handleEditPatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Género</label>
            <input
              name="genero"
              value={editPatientForm.genero}
              onChange={handleEditPatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Fecha de nacimiento</label>
            <input
              name="fecha_nacimiento"
              type="datetime-local"
              value={editPatientForm.fecha_nacimiento}
              onChange={handleEditPatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Altura</label>
            <input
              name="altura"
              type="number"
              step="0.01"
              value={editPatientForm.altura}
              onChange={handleEditPatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Peso</label>
            <input
              name="peso"
              type="number"
              step="0.01"
              value={editPatientForm.peso}
              onChange={handleEditPatientInputChange}
              className="form-control"
            />
          </div>

          <div className="flex items-end">
            <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <input
                type="checkbox"
                name="activo"
                checked={editPatientForm.activo}
                onChange={handleEditPatientInputChange}
              />
              Paciente activo
            </label>
          </div>
        </div>

        {editPatientError && <p className="mt-4 text-sm text-rose-300">{editPatientError}</p>}

        <div className="form-actions">
          <button
            type="submit"
            disabled={isEditingPatient}
            className="admin-submit-button"
          >
            {isEditingPatient ? "Guardando..." : "Actualizar paciente"}
          </button>
          <button
            type="button"
            onClick={closeEditPatientModal}
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
