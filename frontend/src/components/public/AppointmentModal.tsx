import type { ChangeEvent, FormEvent } from "react";
import type { CatalogsResponse, PublicAppointmentForm, PublicProcedure } from "../../types/public";
import { enumLabel, prefixLabel } from "../../utils/public";

type AppointmentModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  submitError: string;
  form: PublicAppointmentForm;
  errors: Partial<Record<keyof PublicAppointmentForm, string>>;
  catalogos: CatalogsResponse | null;
  availableHours: string[];
  procedures: PublicProcedure[];
  selected: string[];
  blockedProcedure: string | null;
  minDate: string;
  onClose: () => void;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleProcedure: (name: string) => void;
};

export default function AppointmentModal({
  isOpen,
  isSubmitting,
  submitError,
  form,
  errors,
  catalogos,
  availableHours,
  procedures,
  selected,
  blockedProcedure,
  minDate,
  onClose,
  onChange,
  onSubmit,
  onToggleProcedure,
}: AppointmentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="agendar-cita-title"
        className="modal-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-white/10 bg-white/5 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Formulario</p>
              <h2 id="agendar-cita-title" className="mt-2 text-2xl font-black text-white">
                Agendar consulta
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Completa tus datos y enviaremos tu solicitud por WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar formulario"
              className="modal-close-button"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="max-h-[85vh] overflow-y-auto px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="nombre" className="form-label">Nombre completo *</label>
              <input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Escribe tu nombre"
                className="form-control"
              />
              {errors.nombre && <p className="form-error">{errors.nombre}</p>}
            </div>

            <div>
              <label htmlFor="tipoDocumento" className="form-label">Tipo de documento *</label>
              <select
                id="tipoDocumento"
                name="tipoDocumento"
                value={form.tipoDocumento}
                onChange={onChange}
                className="form-control form-select"
              >
                {(catalogos?.tipos_documento ?? []).map((value) => (
                  <option key={value} value={value}>{enumLabel(value)}</option>
                ))}
              </select>
              {errors.tipoDocumento && <p className="form-error">{errors.tipoDocumento}</p>}
            </div>

            <div>
              <label htmlFor="sexo" className="form-label">Sexo *</label>
              <select
                id="sexo"
                name="sexo"
                value={form.sexo}
                onChange={onChange}
                className="form-control form-select"
              >
                <option value="">Selecciona una opción</option>
                {(catalogos?.sexos ?? []).map((value) => (
                  <option key={value} value={value}>{enumLabel(value)}</option>
                ))}
              </select>
              {errors.sexo && <p className="form-error">{errors.sexo}</p>}
            </div>

            <div>
              <label htmlFor="documento" className="form-label">Número de documento *</label>
              <input
                id="documento"
                name="documento"
                value={form.documento}
                onChange={onChange}
                inputMode="numeric"
                placeholder="Documento"
                className="form-control"
              />
              {errors.documento && <p className="form-error">{errors.documento}</p>}
            </div>

            <div>
              <label htmlFor="email" className="form-label">Correo electrónico *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="correo@ejemplo.com"
                className="form-control"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="direccion" className="form-label">Dirección *</label>
              <input
                id="direccion"
                name="direccion"
                value={form.direccion}
                onChange={onChange}
                placeholder="Escribe tu dirección"
                className="form-control"
              />
              {errors.direccion && <p className="form-error">{errors.direccion}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="celular" className="form-label">Celular *</label>
              <div className="grid grid-cols-[120px_1fr] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <select
                  id="prefijo"
                  name="prefijo"
                  value={form.prefijo}
                  onChange={onChange}
                  className="border-r border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none"
                >
                  {(catalogos?.prefijos_telefonicos ?? []).map((country) => (
                    <option key={`${country.code}-${country.dial}`} value={country.dial}>
                      {prefixLabel(country.dial, country.code, country.label)}
                    </option>
                  ))}
                </select>
                <input
                  id="celular"
                  name="celular"
                  value={form.celular}
                  onChange={onChange}
                  inputMode="numeric"
                  placeholder="Número"
                  className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.prefijo && <p className="form-error">{errors.prefijo}</p>}
              {errors.celular && <p className="form-error">{errors.celular}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="fecha" className="form-label">Fecha *</label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                min={minDate}
                value={form.fecha}
                onChange={onChange}
                className="form-control"
              />
              {errors.fecha && <p className="form-error">{errors.fecha}</p>}
            </div>

            <div>
              <label htmlFor="hora" className="form-label">Hora *</label>
              <select
                id="hora"
                name="hora"
                value={form.hora}
                onChange={onChange}
                className="form-control form-select"
              >
                <option value="">Selecciona una hora</option>
                {availableHours.map((hour) => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
              {errors.hora && <p className="form-error">{errors.hora}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Procedimientos *</label>
              <div className="grid gap-3 md:grid-cols-2">
                {procedures.map((procedure) => {
                  const active = selected.includes(procedure.nombre);
                  const blocked = blockedProcedure === procedure.nombre;

                  return (
                    <button
                      key={procedure.id}
                      type="button"
                      onClick={() => onToggleProcedure(procedure.nombre)}
                      className={`procedure-option ${active ? "procedure-option-active" : ""} ${
                        blocked ? "opacity-50" : ""
                      }`}
                    >
                      {procedure.nombre}
                    </button>
                  );
                })}
              </div>
              {errors.procedimiento1 && <p className="form-error">{errors.procedimiento1}</p>}
              <p className="mt-2 text-xs text-slate-400">Selecciona mínimo 1 y máximo 2 procedimientos.</p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="mensaje" className="form-label">Mensaje adicional</label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={4}
                value={form.mensaje}
                onChange={onChange}
                placeholder="Cuéntanos qué deseas mejorar o cualquier detalle importante"
                className="form-control resize-none"
              />
            </div>
          </div>

          {submitError && <p className="form-error mt-4">{submitError}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar solicitud por WhatsApp"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary w-full">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
