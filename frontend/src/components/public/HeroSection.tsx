import { HERO_FEATURES } from "../../constants/public";

type HeroSectionProps = {
  onBook: () => void;
};

export default function HeroSection({ onBook }: HeroSectionProps) {
  return (
    <section id="inicio" className="public-section">
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="public-surface p-8 md:p-10">
          <p className="section-kicker">Clínica estética</p>
          <h2 className="mt-3 text-5xl md:text-7xl font-black tracking-tight text-white">Clínica Renacer</h2>
          <p className="mt-4 text-2xl md:text-3xl font-semibold text-cyan-200">Doctor Miguel Mendoza</p>
          <p className="mt-4 text-lg md:text-xl font-medium text-violet-200 italic">
            “Belleza, confianza y acompañamiento en cada etapa del proceso.”
          </p>
          <p className="mt-6 text-lg md:text-xl leading-8 text-slate-300 max-w-2xl">
            Un espacio especializado en procedimientos corporales, atención personalizada y una experiencia moderna.
            El doctor Miguel Mendoza brinda valoración individual, enfoque estético y seguimiento cercano para cada paciente.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button type="button" onClick={onBook} className="btn-primary">
              Agendar consulta
            </button>
            <a href="#procedimientos" className="btn-secondary">
              Ver procedimientos
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-violet-600/20 via-cyan-500/15 to-transparent blur-2xl" />
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
            <div className="aspect-[4/5] w-full rounded-[2rem] bg-black flex items-center justify-center text-lg text-white/45">
              Foto del doctor
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {HERO_FEATURES.map(([title, text]) => (
          <article key={title} className="glass-card text-center flex flex-col items-center justify-center">
            <p className="section-kicker">{title}</p>
            <h3 className="card-title text-center">{title}</h3>
            <p className="card-text text-center max-w-[22rem]">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
