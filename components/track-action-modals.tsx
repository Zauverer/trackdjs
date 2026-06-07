"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { AuthGateModal } from "@/components/auth-gate-modal";

type MigrationDetail = {
  hash: string;
  summary: {
    followedDjs: number;
    seenDjs: number;
    wantToSeeDjs: number;
    savedEvents: number;
    eventPlans: number;
    reminders: number;
  };
  onConfirm: () => Promise<void>;
  onLater: () => void;
  onDismiss: () => void;
};

export function TrackActionModals() {
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [migration, setMigration] = useState<MigrationDetail | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const openAuthGate = () => setAuthGateOpen(true);
    const openMigration = (event: Event) => {
      setMigrationStatus(null);
      setMigration((event as CustomEvent<MigrationDetail>).detail);
    };

    window.addEventListener("trackdjs:auth-gate", openAuthGate);
    window.addEventListener("trackdjs:migration-prompt", openMigration);
    return () => {
      window.removeEventListener("trackdjs:auth-gate", openAuthGate);
      window.removeEventListener("trackdjs:migration-prompt", openMigration);
    };
  }, []);

  return (
    <>
      <AuthGateModal open={authGateOpen} onClose={() => setAuthGateOpen(false)} />
      {migration ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 backdrop-blur-sm sm:place-items-center">
          <div className="glass w-full max-w-md rounded-lg p-5 shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Mi Track</p>
                <h2 className="mt-2 text-2xl font-black text-white">Encontramos actividad local.</h2>
              </div>
              <button aria-label="Cerrar" onClick={() => { migration.onDismiss(); setMigration(null); }} className="rounded-md border border-white/10 p-2 text-white"><X size={18} /></button>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">Puedes guardar tus DJs, eventos y vistos en tu cuenta para que persistan entre dispositivos.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-zinc-300">
              <MigrationCount label="DJs seguidos" value={migration.summary.followedDjs} />
              <MigrationCount label="DJs vistos" value={migration.summary.seenDjs} />
              <MigrationCount label="Quiero ver" value={migration.summary.wantToSeeDjs} />
              <MigrationCount label="Eventos guardados" value={migration.summary.savedEvents} />
              <MigrationCount label="Voy/Fui/Interesa" value={migration.summary.eventPlans} />
              <MigrationCount label="Recordatorios" value={migration.summary.reminders} />
            </div>
            {migrationStatus ? (
              <p className={`mt-4 flex items-center gap-2 text-sm font-bold ${migrationStatus.type === "success" ? "text-success" : "text-pulse"}`}>
                {migrationStatus.type === "success" ? <CheckCircle2 size={16} /> : null}
                {migrationStatus.text}
              </p>
            ) : null}
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <button
                disabled={migrating}
                onClick={async () => {
                  setMigrating(true);
                  setMigrationStatus(null);
                  try {
                    await migration.onConfirm();
                    setMigrationStatus({ type: "success", text: "Actividad guardada en tu cuenta." });
                    window.setTimeout(() => setMigration(null), 900);
                  } catch (error) {
                    console.error("Track migration error", error);
                    setMigrationStatus({ type: "error", text: "No pudimos guardar tu actividad. Tu localStorage sigue intacto." });
                  } finally {
                    setMigrating(false);
                  }
                }}
                className="rounded-md bg-white px-3 py-2 text-sm font-black text-void disabled:opacity-60"
              >
                {migrating ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => { migration.onLater(); setMigration(null); }} className="rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-white">Después</button>
              <button onClick={() => { migration.onDismiss(); setMigration(null); }} className="rounded-md border border-cyan/30 px-3 py-2 text-sm font-bold text-cyan">No guardar</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function MigrationCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
