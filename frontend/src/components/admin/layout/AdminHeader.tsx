
import type { TabKey } from "../../../types/admin";

const tabs: TabKey[] = ["Inicio", "Pacientes", "Citas", "Autorizar Citas"];

type AdminHeaderProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

export default function AdminHeader({ activeTab, onTabChange }: AdminHeaderProps) {
  return (
    <header className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-3 rounded-3xl bg-violet-600/10 px-4 py-2 text-sm text-violet-200 ring-1 ring-violet-500/20">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-lg">R</span>
            <span className="font-semibold">Clínica Renacer</span>
          </div>
          <p className="text-2xl font-black tracking-tight">Panel de administración</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "bg-violet-500 text-slate-950"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/10 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">A</span>
            <div>
              <p className="text-sm text-slate-300">Administrador</p>
              <p className="text-sm font-semibold text-white">Usuario</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
