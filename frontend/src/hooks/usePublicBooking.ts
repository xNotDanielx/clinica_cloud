import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  DOCTOR_WHATSAPP,
  FALLBACK_PROCEDURES,
  INITIAL_PUBLIC_APPOINTMENT_FORM,
} from "../constants/public";
import {
  createPublicAppointment,
  getAvailableHours,
  getCatalogs,
  getPublicProcedures,
} from "../services/public.service";
import type {
  CatalogsResponse,
  PublicAppointmentForm,
  PublicAppointmentPayload,
  PublicProcedure,
} from "../types/public";
import { getMinAppointmentDate } from "../utils/public";

export function usePublicBooking() {
  const [selected, setSelected] = useState<string[]>([]);
  const [blockedProcedure, setBlockedProcedure] = useState<string | null>(null);
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const [catalogos, setCatalogos] = useState<CatalogsResponse | null>(null);
  const [procedures, setProcedures] = useState<PublicProcedure[]>(FALLBACK_PROCEDURES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<PublicAppointmentForm>(INITIAL_PUBLIC_APPOINTMENT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof PublicAppointmentForm, string>>>({});
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const minDate = getMinAppointmentDate();

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
    setSubmitError("");
  };

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onEsc);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [isModalOpen]);

  useEffect(() => {
    let mounted = true;

    getPublicProcedures()
      .then((data) => {
        if (mounted) setProcedures(data.length ? data : FALLBACK_PROCEDURES);
      })
      .catch((error) => {
        console.error("Error cargando procedimientos:", error);
        if (mounted) setProcedures(FALLBACK_PROCEDURES);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    getCatalogs()
      .then((data) => {
        setCatalogos(data);
        setForm((prev) => ({
          ...prev,
          tipoDocumento: prev.tipoDocumento || data.tipos_documento?.[0] || "",
          prefijo: prev.prefijo || data.prefijos_telefonicos?.[0]?.dial || "",
          sexo: prev.sexo || data.sexos?.[0] || "",
        }));
      })
      .catch((error) => console.error("Error cargando catálogos:", error));
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, hora: "" }));

    if (!form.fecha) {
      setAvailableHours([]);
      return;
    }

    getAvailableHours(form.fecha)
      .then(setAvailableHours)
      .catch((error) => {
        console.error("Error cargando horarios:", error);
        setAvailableHours([]);
      });
  }, [form.fecha]);

  const toggleProcedure = (name: string) => {
    if (selected.includes(name)) {
      setSelected((prev) => prev.filter((procedure) => procedure !== name));
      return;
    }

    if (selected.length >= 2) {
      setBlockedProcedure(name);
      setShowLimitMessage(true);
      window.clearTimeout((window as Window & { __limitTimer?: number }).__limitTimer);
      (window as Window & { __limitTimer?: number }).__limitTimer = window.setTimeout(() => {
        setBlockedProcedure(null);
        setShowLimitMessage(false);
      }, 1400);
      return;
    }

    setSelected((prev) => [...prev, name]);
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (name === "nombre") {
      setForm((prev) => ({
        ...prev,
        nombre: value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
      }));
      return;
    }

    if (name === "documento" || name === "celular") {
      setForm((prev) => ({
        ...prev,
        [name]: value.replace(/\D/g, "").slice(0, 20),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const next: Partial<Record<keyof PublicAppointmentForm, string>> = {};

    if (!form.nombre.trim()) next.nombre = "El nombre es obligatorio.";
    if (!form.tipoDocumento) next.tipoDocumento = "El tipo de documento es obligatorio.";
    if (!form.documento.trim()) next.documento = "El número de documento es obligatorio.";
    if (!form.prefijo.trim()) next.prefijo = "El prefijo es obligatorio.";
    if (!form.celular.trim()) next.celular = "El celular es obligatorio.";
    if (!form.email.trim()) next.email = "El correo electrónico es obligatorio.";
    if (!form.direccion.trim()) next.direccion = "La dirección es obligatoria.";
    if (!form.sexo.trim()) next.sexo = "El sexo es obligatorio.";
    if (!form.fecha) {
      next.fecha = "La fecha es obligatoria.";
    } else if (
      new Date(`${form.fecha}T00:00:00`).getTime() <
      new Date(`${minDate}T00:00:00`).getTime()
    ) {
      next.fecha = "La fecha debe ser desde dos días después de hoy.";
    }
    if (!form.hora) next.hora = "La hora es obligatoria.";
    if (selected.length < 1) next.procedimiento1 = "Selecciona al menos un procedimiento.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    const selectedProcedureIds = procedures
      .filter((procedure) => selected.includes(procedure.nombre))
      .map((procedure) => procedure.id);

    const payload: PublicAppointmentPayload = {
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

    const message = [
      `Hola, soy ${form.nombre} y estoy interesad@ en agendar una cita en Clínica Renacer.`,
      `Mis datos son: documento ${form.tipoDocumento} ${form.documento}, número celular +${form.prefijo} ${form.celular}, fecha ${form.fecha}, hora ${form.hora}.`,
      `Me gustaría hacerme estos procedimientos: ${selected.join(" + ")}.`,
      `Mensaje adicional: ${form.mensaje.trim() || "N/A"}.`,
    ].join("\n\n");

    try {
      setIsSubmitting(true);
      await createPublicAppointment(payload);

      window.open(
        `https://wa.me/${DOCTOR_WHATSAPP}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );

      setForm(INITIAL_PUBLIC_APPOINTMENT_FORM);
      setErrors({});
      setSelected([]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creando cita:", error);
      setSubmitError(
        "No se pudo registrar la solicitud. Revisa la disponibilidad e intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selected,
    selectedProcedures: selected.filter(Boolean),
    blockedProcedure,
    showLimitMessage,
    catalogos,
    procedures,
    isModalOpen,
    isSubmitting,
    submitError,
    form,
    errors,
    availableHours,
    minDate,
    openModal,
    closeModal,
    toggleProcedure,
    handleInputChange,
    handleSubmit,
  };
}
