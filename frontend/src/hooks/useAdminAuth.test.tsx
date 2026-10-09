import { act, renderHook, waitFor } from "@testing-library/react";
import type { FormEvent } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { ApiError } from "../services/api";
import { loginAdmin, validateAdminSession } from "../services/auth.service";
import { useAdminAuth } from "./useAdminAuth";

vi.mock("../services/auth.service", () => ({
  loginAdmin: vi.fn(),
  validateAdminSession: vi.fn(),
}));

beforeEach(() => { localStorage.clear(); vi.resetAllMocks(); });

it("restores a validated session and clears it on logout", async () => {
  localStorage.setItem("access_token", "test-token");
  vi.mocked(validateAdminSession).mockResolvedValue({ usuario: "admin_prueba" });
  const { result } = renderHook(() => useAdminAuth());
  await waitFor(() => expect(result.current.checkingSession).toBe(false));
  expect(result.current.loggedIn).toBe(true);
  expect(result.current.username).toBe("admin_prueba");
  act(() => result.current.logout());
  expect(localStorage.getItem("access_token")).toBeNull();
  expect(result.current.loggedIn).toBe(false);
});

it("shows inline invalid-credentials feedback without accepting a session", async () => {
  vi.mocked(loginAdmin).mockRejectedValue(new ApiError(401, "Invalid"));
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {
    await result.current.handleLogin({ preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>);
  });
  expect(result.current.loggedIn).toBe(false);
  expect(result.current.loginError).toBe("Usuario o contraseña incorrectos.");
  expect(result.current.isLoggingIn).toBe(false);
});
