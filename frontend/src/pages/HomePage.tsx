import { useEffect, useRef, useState } from "react";
import { apiFetch, ApiError, apiErrorMessage } from "../components/api";
import AssistantWidget from "../components/AssistantWidget";
import BackToTop from "../components/BackToTop";
import { TrackingCode } from "../components/RequestTracking";
import { SiWhatsapp } from "react-icons/si";
import PublicExperience from "../components/PublicExperience";
import BookingCalendar from "../components/BookingCalendar";
import Feedback from "../components/Feedback";
import ProcedureSelectionFeedback from "../components/ProcedureSelectionFeedback";
import { toggleSelection, replaceSelection } from "../components/procedureSelection";

const fallbackProcedures: any[] = [];

type FormData = {
  nombre: string;
  tipoDocumento: string;
  documento: string;
  prefijo: string;
  celular: string;
  email: string;
  direccion: string;
  sexo: string;
  fecha: string;
  hora: string;
  procedimiento1: string;
  procedimiento2: string;
  mensaje: string;
};

type CatalogosResponse = {
  sexos: string[];
  generos: string[];
  tipos_documento: string[];
  prefijos_telefonicos: CountryPrefix[];
};

type CountryPrefix = {
  code: string;
  label: string;
  dial: string;
};

const initialForm: FormData = {
  nombre: "",
  tipoDocumento: "cedula_chilena",
  documento: "",
  prefijo: "56",
  celular: "",
  email: "",
  direccion: "",
  sexo: "",
  fecha: "",
  hora: "",
  procedimiento1: "",
  procedimiento2: "",
  mensaje: "",
};

function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

function prefixLabel(dial: string, code: string, label: string) {
  return `${countryCodeToFlag(code)} ${label} +${dial}`;
}

export default function HomePage() {
  const bookingDialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingProcedure, setPendingProcedure] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState("");
  const [procedureError, setProcedureError] = useState("");
  const [procedureRetry, setProcedureRetry] = useState(0);
  const errorSummary = useRef<HTMLDivElement>(null);
  const [catalogos, setCatalogos] = useState<CatalogosResponse | null>(null);
  const [proceduresData, setProceduresData] = useState<any[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [calendarRevision, setCalendarRevision] = useState(0);
  const [receipt, setReceipt] = useState<{ id: number; fecha_programada: string; hora_inicio: string; codigo_seguimiento: string } | null>(null);
  const selectedProcedures = selected.filter(Boolean);
  const numeroDoctor = "573175697927";
  const contactMsg = encodeURIComponent("Hola, me gustaría tener más información sobre las citas y procedimientos en la Clínica Renacer");

  const openModal = () => { setReceipt(null); setIsModalOpen(true); };
  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setPendingProcedure(null);
    setErrors({});
    setSubmitError("");
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const dialog = bookingDialog.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [isModalOpen]);

  useEffect(() => {
    let mounted = true;
    setProcedureError("");

    (async () => {
      try {
        const data = await apiFetch("/procedimientos/activos");
        const safe = Array.isArray(data) ? data : [];

        if (mounted) {
          setProceduresData(safe.length ? safe : fallbackProcedures);
        }
      } catch (error) {
        console.error("Error cargando procedimientos:", error);
        if (mounted) {
          setProceduresData(fallbackProcedures);
          setProcedureError("No pudimos cargar los procedimientos. Reintenta antes de enviar una solicitud.");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [procedureRetry]);

  const cargarCatalogos = async () => {
    setCatalogError("");
    try {
      const data = (await apiFetch("/catalogos")) as CatalogosResponse;
      setCatalogos(data);

      setForm((prev) => ({
        ...prev,
        tipoDocumento: prev.tipoDocumento || data.tipos_documento?.[0] || "",
        prefijo: prev.prefijo || data.prefijos_telefonicos?.[0]?.dial || "",
        sexo: prev.sexo || data.sexos?.[0] || "",
      }));
    } catch (error) {
      setCatalogError("No pudimos cargar las opciones del formulario. Reintenta para continuar.");
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  function enumLabel(value: string) {
    const base = value
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    const map: Record<string, string> = {
      "Cedula Chilena": "Cédula chilena",
      "Cedula Extranjero": "Cédula de extranjero",
      "Pasaporte Chileno": "Pasaporte chileno",
      "Pasaporte Extranjero": "Pasaporte extranjero",
      "Documento Extranjero": "Documento extranjero",
    };

    return map[base] ?? base;
  }

  const toggleProcedure = (name: string) => {
    const next = toggleSelection(selected, name);
    setSelected(next.selected);
    setPendingProcedure(next.pending);
    if (!next.pending) setErrors(current => ({ ...current, procedimiento1: undefined }));
  };
  const selectionFeedback = <ProcedureSelectionFeedback selected={selected} pending={pendingProcedure}
    onCancel={() => setPendingProcedure(null)} onReplace={name => {
      if (pendingProcedure) setSelected(current => replaceSelection(current, name, pendingProcedure));
      setPendingProcedure(null);
    }}/>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrors(current => ({ ...current, [name]: undefined }));
    if (name === "nombre") {
      setForm((prev) => ({ ...prev, nombre: value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "") }));
      return;
    }
    if (name === "documento" || name === "celular") {
      setForm((prev) => ({
        ...prev,
        [name]: value.replace(/\D/g, "").slice(0, 20),
      } as FormData));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value } as FormData));
  };

  const validateForm = () => {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.nombre.trim()) next.nombre = "El nombre es obligatorio.";
    if (!form.tipoDocumento) next.tipoDocumento = "El tipo de documento es obligatorio.";
    if (!form.documento.trim()) next.documento = "El número de documento es obligatorio.";
    if (!form.prefijo.trim()) next.prefijo = "El prefijo es obligatorio.";
    if (!form.celular.trim()) next.celular = "El celular es obligatorio.";
    if (!form.email.trim()) next.email = "El correo electrónico es obligatorio.";
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email.trim())) next.email = "Introduce un correo válido, como nombre@ejemplo.com.";
    if (!form.direccion.trim()) next.direccion = "La dirección es obligatoria.";
    if (!form.sexo.trim()) next.sexo = "El sexo es obligatorio.";
    if (!form.fecha) next.fecha = "La fecha es obligatoria.";

    if (!form.hora || !availableHours.includes(form.hora)) next.hora = "Selecciona un horario disponible.";
    if (selected.length < 1) next.procedimiento1 = "Selecciona al menos un procedimiento.";
    setErrors(next);
    if (Object.keys(next).length) requestAnimationFrame(() => {
      errorSummary.current?.focus({ preventScroll: true });
      errorSummary.current?.scrollIntoView({ block: "start", behavior: "auto" });
    });
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError("");

    if (!validateForm() || catalogError || procedureError) return;

    const selectedProcedureIds = procedureList
      .filter((p: any) => selected.includes(p.nombre ?? p.name ?? ""))
      .map((p: any) => p.id);

    const payload = {
      nombre_completo: form.nombre,
      tipo_identificacion: form.tipoDocumento,
      identificacion: form.documento,
      telefono: `+${form.prefijo}${form.celular}`,
      email: form.email.trim(),
      direccion: form.direccion.trim(),
      sexo: form.sexo,
      fecha_programada: form.fecha,
      hora: form.hora,
      procedimiento_ids: selectedProcedureIds,
      nota: form.mensaje.trim() || null,
      valor_consulta: "0.00",
    };

    try {
      setIsSubmitting(true);

      const result = await apiFetch("/citas/publica", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setReceipt(result);
      setForm(initialForm);
      setErrors({});
      setSelected([]);
    } catch (error) {
      console.error("Error creando cita:", error);
      setSubmitError(error instanceof ApiError && error.status === 409
        ? "Ese horario acaba de ocuparse. Elige otro para continuar; tus datos se mantienen."
        : apiErrorMessage(error, "No se pudo registrar la solicitud. Comprueba tus datos y selecciona un horario actualizado."));
      setForm(current => ({ ...current, hora: "" }));
      setCalendarRevision(value => value + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const procedureList = proceduresData ?? fallbackProcedures;

  const startBookingFromAssistant = (
    procedureNames: string[],
    requestedDate?: string | null
  ) => {
    const availableNames = new Set(
      procedureList.map((procedure) => procedure.nombre ?? procedure.name ?? "")
    );
    const matchedProcedures = procedureNames
      .filter((name) => availableNames.has(name))
      .slice(0, 2);

    if (matchedProcedures.length) {
      setSelected(matchedProcedures);
    }
    setForm((current) => ({
      ...current,
      fecha: requestedDate || current.fecha,
      hora: "",
    }));
    setErrors({});
    setSubmitError("");
    setReceipt(null);
    setPendingProcedure(null);
    setIsModalOpen(true);
  };

  return (
    <div className="renacer-home min-h-screen overflow-x-hidden">
      <PublicExperience procedures={procedureList} selected={selectedProcedures} onToggle={toggleProcedure} onBooking={openModal} onGuidedBooking={startBookingFromAssistant} selectionFeedback={!isModalOpen ? selectionFeedback : null} catalogError={procedureError} onRetry={() => setProcedureRetry(value => value + 1)} />

      <AssistantWidget onStartBooking={startBookingFromAssistant} />
      <BackToTop/>

      <a
        href={`https://wa.me/${numeroDoctor}?text=${contactMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-black/40 transition hover:bg-green-400"
      >
        <SiWhatsapp aria-hidden="true" size={30}/>
      </a>

      {isModalOpen && (
          <dialog ref={bookingDialog} data-booking-dialog aria-labelledby="agendar-cita-title" aria-busy={isSubmitting}
            className="r-booking-dialog"
            onCancel={event => { event.preventDefault(); closeModal(); }}>
            <div className="border-b border-white/10 bg-white/5 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Formulario</p>
                  <h2 id="agendar-cita-title" className="mt-2 text-2xl font-black text-white">{receipt ? "Solicitud recibida" : "Solicitar valoración"}</h2>
                  <p className="mt-2 text-sm text-slate-300">{receipt ? "Pendiente de aprobación administrativa." : "Elige un horario y completa tus datos. La clínica revisará tu solicitud."}</p>
                </div>
                <button type="button" disabled={isSubmitting} onClick={closeModal} aria-label="Cerrar formulario" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white transition hover:bg-white/20">×</button>
              </div>
            </div>

            {receipt ? <div className="r-booking-receipt" role="status">
              <Feedback tone="success" title="Solicitud registrada">Número de solicitud: #{receipt.id}</Feedback>
              <p>{receipt.fecha_programada} · {receipt.hora_inicio.slice(0, 5)} · Hora de Santiago</p>
              <Feedback tone="warning" title="Pendiente de aprobación">Tu horario está apartado, pero tu cita aún no está confirmada. Administración debe aprobar la solicitud. Si necesitas consultar su estado, contacta con la clínica e indica este número.</Feedback>
              <TrackingCode code={receipt.codigo_seguimiento}/>
              <button className="r-button" onClick={closeModal}>Entendido</button>
            </div> : <form noValidate onSubmit={handleSubmit} className="max-h-[65vh] overflow-y-auto px-6 py-6">
              <fieldset disabled={isSubmitting}>
              {Object.values(errors).some(Boolean) && <div ref={errorSummary} className="form-error-summary" tabIndex={-1}><Feedback title="Revisa los campos indicados">
                <p>Tu solicitud todavía no se ha enviado.</p><ul>{Object.entries(errors).filter(([,message]) => message).map(([key,message]) => <li key={key}>{message}</li>)}</ul>
              </Feedback></div>}
              {catalogError && <Feedback title="Formulario no disponible"><p>{catalogError}</p><div className="feedback-actions"><button type="button" onClick={cargarCatalogos}>Reintentar</button></div></Feedback>}
              {procedureError && <Feedback title="Catálogo no disponible"><p>{procedureError}</p><div className="feedback-actions"><button type="button" onClick={() => setProcedureRetry(value => value + 1)}>Reintentar</button></div></Feedback>}
              <BookingCalendar date={form.fecha} hour={form.hora} revision={calendarRevision}
                onChange={(fecha, hora) => { setForm(current => ({ ...current, fecha, hora })); setErrors(current => ({ ...current, fecha: undefined, hora: undefined })); }}
                onHours={setAvailableHours}/>
              {errors.fecha && <p id="error-fecha" className="field-error">{errors.fecha}</p>}
              {errors.hora && <p id="error-hora" className="field-error">{errors.hora}</p>}
              {selected.length > 0 && <p className="r-booking-selection">Tu selección: {selected.join(" + ")}</p>}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-slate-200">Nombre completo *</label>
                  <input id="nombre" aria-invalid={!!errors.nombre} aria-describedby={errors.nombre ? "error-nombre" : undefined} name="nombre" value={form.nombre} onChange={handleInputChange} placeholder="Escribe tu nombre" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 transition focus:border-cyan-400" />
                  {errors.nombre && <p id="error-nombre" className="field-error">{errors.nombre}</p>}
                </div>

                <div>
                  <label htmlFor="tipoDocumento" className="mb-2 block text-sm font-medium text-slate-200">Tipo de documento *</label>
                  <select
                    id="tipoDocumento" aria-invalid={!!errors.tipoDocumento} aria-describedby={errors.tipoDocumento ? "error-tipoDocumento" : undefined}
                    name="tipoDocumento"
                    value={form.tipoDocumento}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                  >
                    {(catalogos?.tipos_documento ?? []).map((value) => (
                      <option key={value} value={value}>
                        {enumLabel(value)}
                      </option>
                    ))}
                  </select>
                  {errors.tipoDocumento && <p id="error-tipoDocumento" className="field-error">{errors.tipoDocumento}</p>}
                </div>

                <div>
                  <label htmlFor="sexo" className="mb-2 block text-sm font-medium text-slate-200">Sexo *</label>
                  <select
                    id="sexo" aria-invalid={!!errors.sexo} aria-describedby={errors.sexo ? "error-sexo" : undefined}
                    name="sexo"
                    value={form.sexo}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="">Selecciona una opción</option>
                    {(catalogos?.sexos ?? []).map((value) => (
                      <option key={value} value={value}>
                        {enumLabel(value)}
                      </option>
                    ))}
                  </select>
                  {errors.sexo && <p id="error-sexo" className="field-error">{errors.sexo}</p>}
                </div>

                <div>
                  <label htmlFor="documento" className="mb-2 block text-sm font-medium text-slate-200">Número de documento *</label>
                  <input id="documento" aria-invalid={!!errors.documento} aria-describedby={errors.documento ? "error-documento" : undefined} name="documento" value={form.documento} onChange={handleInputChange} inputMode="numeric" placeholder="Documento" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 transition focus:border-cyan-400" />
                  {errors.documento && <p id="error-documento" className="field-error">{errors.documento}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Correo electrónico *</label>
                  <input
                    id="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "error-email" : undefined}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 transition focus:border-cyan-400"
                  />
                  {errors.email && <p id="error-email" className="field-error">{errors.email}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="direccion" className="mb-2 block text-sm font-medium text-slate-200">Dirección *</label>
                  <input
                    id="direccion" aria-invalid={!!errors.direccion} aria-describedby={errors.direccion ? "error-direccion" : undefined}
                    name="direccion"
                    value={form.direccion}
                    onChange={handleInputChange}
                    placeholder="Escribe tu dirección"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 transition focus:border-cyan-400"
                  />
                  {errors.direccion && <p id="error-direccion" className="field-error">{errors.direccion}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="celular" className="mb-2 block text-sm font-medium text-slate-200">Celular *</label>
                  <div className="grid grid-cols-[120px_1fr] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <select
                      id="prefijo" aria-invalid={!!errors.prefijo} aria-describedby={errors.prefijo ? "error-prefijo" : undefined}
                      name="prefijo"
                      value={form.prefijo}
                      onChange={handleInputChange}
                      className="border-r border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none"
                    >
                      {(catalogos?.prefijos_telefonicos ?? []).map((c) => (
                        <option key={`${c.code}-${c.dial}`} value={c.dial}>
                          {prefixLabel(c.dial, c.code, c.label)}
                        </option>
                      ))}
                    </select>
                    <input
                      id="celular" aria-invalid={!!errors.celular} aria-describedby={errors.celular ? "error-celular" : undefined}
                      name="celular"
                      value={form.celular}
                      onChange={handleInputChange}
                      inputMode="numeric"
                      placeholder="Número"
                      className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400"
                    />
                  </div>
                  {errors.prefijo && <p id="error-prefijo" className="field-error">{errors.prefijo}</p>}
                  {errors.celular && <p id="error-celular" className="field-error">{errors.celular}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-200">Procedimientos · {selected.length}/2 seleccionados *</label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {procedureList.map((p) => {
                      const name = p.nombre ?? p.name ?? "";
                      const active = selected.includes(name);
                      return (
                        <label key={name} className="r-booking-procedure">
                          <input type="checkbox" checked={active} onChange={() => toggleProcedure(name)}/>
                          <span>{name}</span>
                        </label>
                      );
                    })}
                  </div>
                  {selectionFeedback}
                  {errors.procedimiento1 && <p id="error-procedimiento1" className="field-error">{errors.procedimiento1}</p>}
                  <p className="mt-2 text-xs text-slate-400">Selecciona mínimo 1 y máximo 2 procedimientos.</p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="mensaje" className="mb-2 block text-sm font-medium text-slate-200">Mensaje adicional</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={4}
                    value={form.mensaje}
                    onChange={handleInputChange}
                    placeholder="Cuéntanos qué deseas mejorar o cualquier detalle importante"
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 transition focus:border-cyan-400"
                  />
                </div>
              </div>

              {submitError && <Feedback title="No se envió la solicitud">{submitError}</Feedback>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={isSubmitting || !!catalogError || !!procedureError} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? "Enviando..." : "Enviar solicitud de valoración"}
                </button>
                <button type="button" onClick={closeModal} className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Cancelar
                </button>
              </div>
              </fieldset>
            </form>}
          </dialog>
      )}
    </div>
  );
}
