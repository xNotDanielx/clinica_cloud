
import type { TabKey } from "../../../types/admin";

const sidebarItems: TabKey[] = ["Inicio", "Pacientes", "Citas", "Autorizar Citas"];

type AdminSidebarProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onLogout: () => void;
};

export default function AdminSidebar({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  return (
    <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Navegación</p>
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onTabChange(item)}
                className={`flex w-full items-center justify-between rounded-3xl border px-4 py-4 text-left text-sm font-semibold transition ${
                  activeTab === item
                    ? "border-cyan-400/30 bg-cyan-500/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/20 hover:bg-white/10"
                }`}
              >
                <span>{item}</span>
                {activeTab === item ? <span>·</span> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Estado</p>
          <p className="mt-3 text-lg font-semibold text-white">Panel activo</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Usa esta página para gestionar pacientes, citas y autorizaciones desde la administración.
          </p>
        </div>

        <button
          className="w-full rounded-3xl bg-red-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-red-400"
          type="button"
          onClick={onLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
