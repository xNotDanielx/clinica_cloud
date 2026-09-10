
export default function AdminHomeSection() {
  return (
    <section className="rounded-4xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Bienvenido</p>
          <h1 className="mt-3 text-4xl font-black text-white">Hola, Administrador</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Bienvenido al panel de administración. Desde aquí puedes gestionar pacientes, citas y autorizaciones.
          </p>
        </div>
        <div className="rounded-4xl border border-white/10 bg-slate-950/70 p-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-violet-500/10 text-3xl text-violet-300">👋</div>
          <p className="mt-5 text-sm uppercase tracking-[0.28em] text-cyan-300">Administración</p>
          <p className="mt-2 text-xl font-bold text-white">Dashboard</p>
        </div>
      </div>
    </section>
  );
}
