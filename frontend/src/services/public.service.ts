import { apiFetch } from "./api";
import type {
  CatalogsResponse,
  PublicAppointmentPayload,
  PublicProcedure,
} from "../types/public";

export async function getPublicProcedures(): Promise<PublicProcedure[]> {
  const data = await apiFetch("/procedimientos/activos");
  return Array.isArray(data) ? (data as PublicProcedure[]) : [];
}

export function getCatalogs(): Promise<CatalogsResponse> {
  return apiFetch("/catalogos");
}

export async function getAvailableHours(fecha: string): Promise<string[]> {
  const data = await apiFetch(`/citas/horarios-disponibles?fecha=${encodeURIComponent(fecha)}`);
  return Array.isArray(data?.horarios) ? data.horarios : [];
}

export function createPublicAppointment(payload: PublicAppointmentPayload) {
  return apiFetch("/citas/publica", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
