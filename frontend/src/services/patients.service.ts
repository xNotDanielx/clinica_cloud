import { apiFetch } from "./api";
import type { CreatePatientFormData, EditPatientFormData, Patient } from "../types/patient";

export function getPatients(): Promise<Patient[]> {
  return apiFetch("/pacientes");
}

export function searchPatients(query: string): Promise<Patient[]> {
  return apiFetch(`/pacientes/filtrar?buscar=${encodeURIComponent(query)}`);
}

export function deletePatient(identificacion: string) {
  return apiFetch(`/pacientes/${identificacion}`, { method: "DELETE" });
}

export function createPatient(form: CreatePatientFormData) {
  return apiFetch("/pacientes", {
    method: "POST",
    body: JSON.stringify({
      identificacion: form.identificacion.trim(),
      tipo_identificacion: form.tipo_identificacion,
      nombre_completo: form.nombre_completo.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      direccion: form.direccion.trim(),
      sexo: form.sexo,
      nacionalidad: null,
      genero: null,
      fecha_nacimiento: null,
      altura: null,
      peso: null,
      activo: form.activo,
    }),
  });
}

export function updatePatient(identificacion: string, form: EditPatientFormData) {
  return apiFetch(`/pacientes/${identificacion}`, {
    method: "PATCH",
    body: JSON.stringify({
      tipo_identificacion: form.tipo_identificacion,
      nombre_completo: form.nombre_completo.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      direccion: form.direccion.trim(),
      sexo: form.sexo,
      nacionalidad: form.nacionalidad.trim() || null,
      genero: form.genero.trim() || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      altura: form.altura ? Number(form.altura) : null,
      peso: form.peso ? Number(form.peso) : null,
      activo: form.activo,
    }),
  });
}
