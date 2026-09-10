
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
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
    onClick={closeCreatePatientModal}
  >
    <div
      className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="border-b border-white/10 bg-white/5 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Pacientes</p>
            <h2 className="mt-2 text-2xl font-black text-white">Agregar paciente</h2>
            <p className="mt-2 text-sm text-slate-300">
              Registra solo los datos necesarios del paciente.
            </p>
          </div>
          <button
            type="button"
            onClick={closeCreatePatientModal}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white transition hover:bg-white/20"
          >
            ×
          </button>
        </div>
      </div>

      <form onSubmit={handleCreatePatient} className="px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Identificación</label>
            <input
              name="identificacion"
              value={createPatientForm.identificacion}
              onChange={handleCreatePatientInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Tipo de identificación</label>
            <select
              name="tipo_identificacion"
              value={createPatientForm.tipo_identificacion}
              onChange={handleCreatePatientInputChange}
              className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="cedula_chilena">Cédula chilena</option>
              <option value="cedula_extranjero">Cédula extranjero</option>
              <option value="pasaporte_chileno">Pasaporte chileno</option>
              <option value="pasaporte_extranjero">Pasaporte extranjero</option>
              <option value="documento_extranjero">Documento extranjero</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-200">Nombre completo</label>
            <input
              name="nombre_completo"
              value={createPatientForm.nombre_completo}
              onChange={handleCreatePatientInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Teléfono</label>
            <input
              name="telefono"
              value={createPatientForm.telefono}
              onChange={handleCreatePatientInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <input
              name="email"
              type="email"
              value={createPatientForm.email}
              onChange={handleCreatePatientInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-200">Dirección</label>
            <input
              name="direccion"
              value={createPatientForm.direccion}
              onChange={handleCreatePatientInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Sexo</label>
            <select
              name="sexo"
              value={createPatientForm.sexo}
              onChange={handleCreatePatientInputChange}
              className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isCreatingPatient}
            className="w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingPatient ? "Guardando..." : "Guardar paciente"}
          </button>
          <button
            type="button"
            onClick={closeCreatePatientModal}
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
