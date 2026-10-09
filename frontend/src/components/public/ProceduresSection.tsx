import { API_URL } from "../../services/api";
import type { PublicProcedure } from "../../types/public";

type ProceduresSectionProps = {
  procedures: PublicProcedure[];
  selected: string[];
  selectedProcedures: string[];
  blockedProcedure: string | null;
  showLimitMessage: boolean;
  onToggleProcedure: (name: string) => void;
  onBook: () => void;
};

function procedureImageUrl(rawImage?: string | null) {
  if (!rawImage) return "";
  if (rawImage.startsWith("http")) return rawImage;
  return `${API_URL}/${rawImage.replace(/^\/+/, "")}`;
}

export default function ProceduresSection({
  procedures,
  selected,
  selectedProcedures,
  blockedProcedure,
  showLimitMessage,
  onToggleProcedure,
  onBook,
}: ProceduresSectionProps) {
  return (
    <section id="procedimientos" className="public-section">
      <div className="mb-10 text-center max-w-4xl mx-auto">
        <p className="section-kicker">Procedimientos</p>
        <h3 className="section-title">Servicios corporales disponibles</h3>
        <p className="section-description">Selecciona mínimo 1 y máximo 2 procedimientos.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {procedures.map((procedure) => {
          const active = selected.includes(procedure.nombre);
          const blocked = blockedProcedure === procedure.nombre;
          const image = procedureImageUrl(procedure.url_imagen);

          return (
            <button
              key={procedure.id}
              type="button"
              onClick={() => onToggleProcedure(procedure.nombre)}
              className={`procedure-hover-card p-8 ${active ? "ring-2 ring-cyan-400" : ""} ${
                blocked ? "ring-2 ring-red-500 bg-red-500/20 border-red-400/50" : ""
              }`}
            >
              <div className="procedure-hover-front h-full flex flex-col items-center justify-center text-center">
                <p className="text-2xl font-black text-white uppercase tracking-[0.06em] leading-tight">
                  {procedure.nombre}
                </p>
                <p className="mt-6 text-lg md:text-xl text-slate-200 leading-8 max-w-[30rem] mx-auto">
                  {procedure.descripcion}
                </p>
              </div>

              <div className="procedure-hover-image">
                {image ? (
                  <img src={image} alt={procedure.nombre} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-black" aria-hidden="true" />
                )}
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-lg font-bold text-white">{procedure.nombre}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {showLimitMessage && (
        <div className="mt-8 rounded-3xl border border-red-500/40 bg-red-500/10 p-5 md:p-6 text-red-100 backdrop-blur-xl text-center">
          <p className="text-lg md:text-xl font-semibold">Máximo 2 procedimientos.</p>
        </div>
      )}

      <div className="mt-10 public-surface p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="mx-auto md:mx-0 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300 font-semibold">
            Procedimientos seleccionados
          </p>
          <h4 className="mt-2 text-2xl md:text-3xl font-black leading-tight">
            {selectedProcedures.length > 0
              ? selectedProcedures.join(" + ")
              : "Sin procedimientos seleccionados"}
          </h4>
          <p className="mt-3 text-base md:text-lg text-slate-300 max-w-2xl mx-auto md:mx-0">
            Los valores se confirman directamente con el doctor durante la consulta, ya que pueden variar según
            promociones, valoración médica y características del procedimiento.
          </p>
        </div>
        <button type="button" onClick={onBook} className="btn-primary text-lg md:text-xl">
          Agendar consulta
        </button>
      </div>
    </section>
  );
}
