import Feedback from "./Feedback";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";

type AdminLoginProps = {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  error: string;
  isLoading: boolean;
};

export default function AdminLogin({ username, password, onUsernameChange, onPasswordChange, onSubmit, error, isLoading }: AdminLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  return <main className="a-login">
    <a href="#" className="a-brand">renacer<span>.</span></a>
    <div className="a-login-form">
      <ShieldCheck size={28} />
      <p className="a-kicker">ESPACIO DE TRABAJO</p>
      <h1>Bienvenido de nuevo.</h1>
      <p>Accede a la administración de Renacer.</p>
      <form onSubmit={onSubmit} aria-busy={isLoading}>
        <label htmlFor="admin-user">Usuario</label>
        <input id="admin-user" autoComplete="username" autoCapitalize="none" required disabled={isLoading} value={username} onChange={event => onUsernameChange(event.target.value)} placeholder="Nombre de usuario" />
        <label htmlFor="admin-password">Contraseña</label>
        <div className="a-password">
          <input id="admin-password" aria-invalid={!!error} type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={isLoading} value={password} onChange={event => onPasswordChange(event.target.value)} placeholder="Contraseña" aria-describedby={error ? "login-error" : undefined} />
          <button type="button" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        {error && <Feedback id="login-error">{error}</Feedback>}
        <button type="submit" className="a-primary" disabled={isLoading}>{isLoading ? "Iniciando sesión..." : "Iniciar sesión"} {isLoading ? <LoaderCircle size={17} className="a-spin" /> : <ArrowRight size={17} />}</button>
      </form>
      <a href="#"><ArrowLeft size={15} /> Volver a la clínica</a>
    </div>
    <span className="a-login-footer">Clínica Renacer · Administración</span>
  </main>;
}
