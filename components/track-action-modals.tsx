"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { AuthGateModal } from "@/components/auth-gate-modal";

type MigrationDetail = {
  onConfirm: () => Promise<void>;
  onLater: () => void;
  onDismiss: () => void;
};

export function TrackActionModals() {
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [migration, setMigration] = useState<MigrationDetail | null>(null);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    const openAuthGate = () => setAuthGateOpen(true);
    const openMigration = (event: Event) => setMigration((event as CustomEvent<MigrationDetail>).detail);

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
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <button
                disabled={migrating}
                onClick={async () => {
                  setMigrating(true);
                  await migration.onConfirm();
                  setMigrating(false);
                  setMigration(null);
                }}
                className="rounded-md bg-white px-3 py-2 text-sm font-black text-void disabled:opacity-60"
              >
                {migrating ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => { migration.onLater(); setMigration(null); }} className="rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-white">Después</button>
              <Link href="/app/my-track" onClick={() => { migration.onDismiss(); setMigration(null); }} className="rounded-md border border-cyan/30 px-3 py-2 text-center text-sm font-bold text-cyan">No guardar</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
