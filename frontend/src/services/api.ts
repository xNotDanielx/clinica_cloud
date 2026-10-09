export const API_URL = (import.meta.env.VITE_BACKEND_URL || "/api").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Tu sesión ha caducado. Vuelve a iniciar sesión.";
    if (error.status === 403) return "No tienes permisos para realizar esta acción.";
    if (error.status === 409) return "La operación entra en conflicto con un registro existente. Revisa los datos o el horario.";
    if (error.status === 422) return "Hay datos inválidos o incompletos. Revisa los campos e inténtalo de nuevo.";
    if (error.status === 429) return "Hay demasiadas solicitudes. Espera un momento antes de reintentar.";
    if (error.status >= 500) return "El servidor no pudo completar la operación. Inténtalo de nuevo más tarde.";
  }
  if (error instanceof TypeError) return "No se pudo conectar con el servidor. Comprueba tu conexión y vuelve a intentarlo.";
  return fallback;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.status === 204 ? null : response.json();
}
