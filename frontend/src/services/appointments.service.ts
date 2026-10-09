import { apiFetch } from "./api";
import type { Appointment, CreateAppointmentFormData, EditAppointmentFormData } from "../types/appointment";

export function getAppointments(): Promise<Appointment[]> {
  return apiFetch("/citas/todas");
}

export function searchAppointments(query: string): Promise<Appointment[]> {
  return apiFetch(`/citas/filtrar?buscar=${encodeURIComponent(query)}`);
}

export function getPendingAppointments(): Promise<Appointment[]> {
  return apiFetch("/citas/pendientes-aprobacion");
}

export function deleteAppointment(appointmentId: number) {
  return apiFetch(`/citas/${appointmentId}`, { method: "DELETE" });
}

export function approveAppointment(appointmentId: number) {
  return apiFetch(`/citas/${appointmentId}/aprobar`, { method: "PATCH" });
}

export function rejectAppointment(appointmentId: number) {
  return apiFetch(`/citas/${appointmentId}/rechazar`, { method: "PATCH" });
}

function toAppointmentPayload(form: CreateAppointmentFormData | EditAppointmentFormData) {
  return {
    id_paciente: form.id_paciente,
    fecha_programada: form.fecha_programada,
    hora_inicio: form.hora_inicio,
    hora_fin: form.hora_fin,
    nota: form.nota.trim() || null,
    estado: form.estado,
    procedimiento_ids: form.procedimiento_ids,
    valor_consulta: Number(form.valor_consulta || 0),
    id_codigo_promocional: form.id_codigo_promocional
      ? Number(form.id_codigo_promocional)
      : null,
  };
}

export function createAppointment(form: CreateAppointmentFormData) {
  return apiFetch("/citas", {
    method: "POST",
    body: JSON.stringify(toAppointmentPayload(form)),
  });
}

export function updateAppointment(appointmentId: number, form: EditAppointmentFormData) {
  return apiFetch(`/citas/${appointmentId}`, {
    method: "PATCH",
    body: JSON.stringify(toAppointmentPayload(form)),
  });
}
