"use client";

import { Copy, Sparkles } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { trackEvent } from "@/lib/analytics";

export function ShareCard({ seen, events, genre }: { seen: number; events: number; genre: string }) {
  const text = `Mi Track 2026: ${seen} DJs vistos, ${events} fiestas asistidas. Genero principal: ${genre}.`;

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-neon via-pulse to-cyan p-[1px] shadow-glow">
      <div className="rounded-lg bg-black/80 p-5">
        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm font-black uppercase tracking-[0.2em] text-cyan">Mi Track 2026</span>
          <Sparkles className="text-white" size={20} />
        </div>
        <div className="text-5xl font-black leading-none text-white">{seen}</div>
        <p className="mt-2 text-lg font-bold text-white">DJs vistos</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-md bg-white/10 p-3">
            <div className="text-2xl font-black">{events}</div>
            <div className="text-xs text-zinc-300">fiestas asistidas</div>
          </div>
          <div className="rounded-md bg-white/10 p-3">
            <div className="text-sm font-black">{genre}</div>
            <div className="text-xs text-zinc-300">genero principal</div>
          </div>
        </div>
        <ActionButton className="mt-5 w-full" onClick={() => { trackEvent("my_track_shared"); navigator.clipboard?.writeText(text); }} icon={<Copy size={16} />}>
          Compartir mi Track
        </ActionButton>
      </div>
    </section>
  );
}
