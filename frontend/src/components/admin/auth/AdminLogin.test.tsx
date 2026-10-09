import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminLogin from "./AdminLogin";

describe("AdminLogin", () => {
  it("renders the administrator login form", () => {
    render(
      <AdminLogin
        username=""
        password=""
        onUsernameChange={vi.fn()}
        onPasswordChange={vi.fn()}
        onSubmit={vi.fn()}
        onForgotPassword={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: /acceso administrador/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
  });

  it("forwards field changes and forgot-password clicks", () => {
    const onUsernameChange = vi.fn();
    const onPasswordChange = vi.fn();
    const onForgotPassword = vi.fn();

    render(
      <AdminLogin
        username=""
        password=""
        onUsernameChange={onUsernameChange}
        onPasswordChange={onPasswordChange}
        onSubmit={vi.fn()}
        onForgotPassword={onForgotPassword}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/nombre de usuario/i), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: "segura" },
    });
    fireEvent.click(screen.getByRole("button", { name: /olvidé contraseña/i }));

    expect(onUsernameChange).toHaveBeenCalledWith("admin");
    expect(onPasswordChange).toHaveBeenCalledWith("segura");
    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });
});
