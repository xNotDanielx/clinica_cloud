const DEFAULT_API_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

export const API_URL = (
  import.meta.env.VITE_BACKEND_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
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
    throw new Error(await response.text());
  }

  return response.json();
}
