import { API_URL, apiFetch } from "./api";

export type AdminLoginResponse = {
  access_token: string;
  token_type?: string;
};

export async function loginAdmin(username: string, password: string): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_URL}/administradores/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usuario: username,
      contrasena: password,
    }),
  });

  if (!response.ok) {
    throw new Error("Credenciales inválidas");
  }

  return response.json();
}

export async function validateAdminSession() {
  return apiFetch("/administradores/me");
}
