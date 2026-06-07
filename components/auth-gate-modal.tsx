"use client";

import Link from "next/link";
import { X } from "lucide-react";

export function AuthGateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 backdrop-blur-sm sm:place-items-center">
      <div className="glass w-full max-w-md rounded-lg p-5 shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Tu Track</p>
            <h2 className="mt-2 text-2xl font-black text-white">Crea tu Track para guardar tu actividad.</h2>
          </div>
          <button aria-label="Cerrar" onClick={onClose} className="rounded-md border border-white/10 p-2 text-white"><X size={18} /></button>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">Puedes seguir usando la app sin cuenta. Si entras, tus eventos y DJs quedarán listos para guardarse en tu perfil.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <button onClick={onClose} className="rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-white">Continuar</button>
          <Link href="/signup" className="rounded-md bg-white px-3 py-2 text-center text-sm font-black text-void">Crear cuenta</Link>
          <Link href="/login" className="rounded-md border border-cyan/30 px-3 py-2 text-center text-sm font-bold text-cyan">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
