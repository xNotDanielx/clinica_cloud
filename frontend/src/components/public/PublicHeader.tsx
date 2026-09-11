export default function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="w-[320px] shrink-0 leading-tight">
          <p className="text-sm md:text-base font-semibold uppercase tracking-[0.35em] text-cyan-300 whitespace-nowrap">
            CLÍNICA ESTÉTICA
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white whitespace-nowrap">
            Renacer
          </h1>
        </div>

        <nav className="hidden md:flex flex-1 justify-center items-center gap-10 text-base md:text-lg font-bold">
          <a className="nav-link-ghost text-base md:text-lg uppercase tracking-[0.16em]" href="#inicio">
            INICIO
          </a>
          <a className="nav-link-ghost text-base md:text-lg uppercase tracking-[0.16em]" href="#procedimientos">
            PROCEDIMIENTOS
          </a>
          <a className="nav-link-ghost text-base md:text-lg uppercase tracking-[0.16em]" href="#galeria">
            ANTES Y DESPUÉS
          </a>
          <a className="nav-link-ghost text-base md:text-lg uppercase tracking-[0.16em]" href="#contacto">
            CONTÁCTANOS
          </a>
        </nav>
      </div>
    </header>
  );
}
