import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { loginAdmin, validateAdminSession } from "../services/auth.service";

export function useAdminAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setCheckingSession(false);
        return;
      }

      try {
        await validateAdminSession();
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

    try {
      const data = await loginAdmin(username, password);
      localStorage.setItem("access_token", data.access_token);
      setPassword("");
      setLoggedIn(true);
    } catch (error) {
      console.error(error);
      alert("Usuario o contraseña incorrectos");
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
    checkingSession,
    username,
    password,
    setUsername,
    setPassword,
    handleLogin,
    logout,
  };
}
