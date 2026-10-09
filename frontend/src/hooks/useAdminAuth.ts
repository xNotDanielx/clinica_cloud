import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, apiErrorMessage } from "../services/api";
import { loginAdmin, validateAdminSession } from "../services/auth.service";

export function useAdminAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setCheckingSession(false);
        return;
      }

      try {
        const admin = await validateAdminSession();
        setUsername(admin.usuario);
        setLoggedIn(true);
      } catch (error) {
        console.error("Sesión inválida o expirada:", error);
        localStorage.removeItem("access_token");
        setLoggedIn(false);
      } finally {
        setCheckingSession(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoggingIn) return;
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const data = await loginAdmin(username.trim(), password);
      localStorage.setItem("access_token", data.access_token);
      setPassword("");
      setLoggedIn(true);
    } catch (error) {
      console.error(error);
      setLoginError(error instanceof ApiError && error.status === 401 ? "Usuario o contraseña incorrectos." : apiErrorMessage(error, "No se pudo iniciar sesión."));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  return {
    loggedIn,
    loginError,
    isLoggingIn,
    checkingSession,
    username,
    password,
    setUsername,
    setPassword,
    handleLogin,
    logout,
  };
}
