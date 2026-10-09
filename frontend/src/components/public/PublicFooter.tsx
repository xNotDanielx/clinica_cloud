export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <p>Clínica Renacer · Plataforma de gestión y agendamiento</p>
        <a href="#admin" className="transition hover:text-cyan-300">
          Acceso administrativo
        </a>
      </div>
    </footer>
  );
}
