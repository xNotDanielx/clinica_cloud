type AdminLoginProps = {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onForgotPassword: () => void;
};

export default function AdminLogin({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
}: AdminLoginProps) {
  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_right,rgba(56,189,248,0.16),transparent_28%),linear-gradient(180deg,#050816_0%,#090b1a_100%)]" />
      <div className="fixed inset-0 -z-10 opacity-25 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10 text-4xl text-violet-300">
          🔐
        </div>

        <p className="mt-6 text-center text-sm uppercase tracking-[0.28em] text-cyan-300">
          Administración
        </p>

        <h1 className="mt-3 text-center text-4xl font-black text-white">
          Acceso administrador
        </h1>

        <p className="mt-4 text-center text-lg leading-8 text-slate-300">
          Ingresa tu usuario y contraseña para acceder al panel de administración.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              placeholder="Nombre de usuario"
              className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-4 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-4 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button type="submit" className="btn-primary">
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={onForgotPassword}
              className="btn-secondary"
            >
              Olvidé contraseña
            </button>
          </div>

          <a
            href="/#"
            className="block w-full rounded-3xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 text-center text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
          >
            Volver a la página principal
          </a>
        </form>
      </div>
    </div>
  );
}

