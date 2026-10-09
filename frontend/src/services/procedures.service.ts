import { apiFetch } from "./api";
import type { Procedure } from "../types/procedure";

export function getActiveProcedures(): Promise<Procedure[]> {
  return apiFetch("/procedimientos/activos");
}
