
import type { ChangeEvent, FormEvent } from "react";
import type { CreatePatientFormData } from "../../../types/patient";

type CreatePatientModalProps = {
  form: CreatePatientFormData;
  error: string;
  isSubmitting: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function CreatePatientModal({
  form,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: CreatePatientModalProps) {
  const createPatientForm = form;
  const createPatientError = error;
  const isCreatingPatient = isSubmitting;
  const handleCreatePatientInputChange = onChange;
  const handleCreatePatient = onSubmit;
  const closeCreatePatientModal = onClose;

  return (
<div
    className="modal-backdrop"
    onClick={closeCreatePatientModal}
  >
    <div
      className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="modal-header">
        <div className="modal-heading-row">
          <div>
            <p className="modal-kicker">Pacientes</p>
            <h2 className="modal-title">Agregar paciente</h2>
            <p className="mt-2 text-sm text-slate-300">
              Registra solo los datos necesarios del paciente.
            </p>
          </div>
          <button
            type="button"
            onClick={closeCreatePatientModal}
            className="modal-close-button"
          >
            ×
          </button>
        </div>
      </div>

      <form onSubmit={handleCreatePatient} className="px-6 py-6">
        <div className="form-grid">
          <div>
            <label className="form-label">Identificación</label>
            <input
              name="identificacion"
              value={createPatientForm.identificacion}
              onChange={handleCreatePatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Tipo de identificación</label>
            <select
              name="tipo_identificacion"
              value={createPatientForm.tipo_identificacion}
              onChange={handleCreatePatientInputChange}
              className="form-control form-select"
            >
              <option value="cedula_chilena">Cédula chilena</option>
              <option value="cedula_extranjero">Cédula extranjero</option>
              <option value="pasaporte_chileno">Pasaporte chileno</option>
              <option value="pasaporte_extranjero">Pasaporte extranjero</option>
              <option value="documento_extranjero">Documento extranjero</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Nombre completo</label>
            <input
              name="nombre_completo"
              value={createPatientForm.nombre_completo}
              onChange={handleCreatePatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Teléfono</label>
            <input
              name="telefono"
              value={createPatientForm.telefono}
              onChange={handleCreatePatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              value={createPatientForm.email}
              onChange={handleCreatePatientInputChange}
              className="form-control"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Dirección</label>
            <input
              name="direccion"
              value={createPatientForm.direccion}
              onChange={handleCreatePatientInputChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Sexo</label>
            <select
              name="sexo"
              value={createPatientForm.sexo}
              onChange={handleCreatePatientInputChange}
              className="form-control form-select"
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <input
                type="checkbox"
                name="activo"
                checked={createPatientForm.activo}
                onChange={handleCreatePatientInputChange}
              />
              Paciente activo
            </label>
          </div>
        </div>

        {createPatientError && <p className="mt-4 text-sm text-rose-300">{createPatientError}</p>}

        <div className="form-actions">
          <button
            type="submit"
            disabled={isCreatingPatient}
            className="admin-submit-button"
          >
            {isCreatingPatient ? "Guardando..." : "Guardar paciente"}
          </button>
          <button
            type="button"
            onClick={closeCreatePatientModal}
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
