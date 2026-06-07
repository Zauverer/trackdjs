"use client";

import { useState } from "react";

const dimensions = ["Sonido", "Acceso", "Seguridad", "Visuales", "Puntualidad", "Ambiente"];

export function ProducerFeedbackSummary({ reviews = 24, rating = 4.6 }: { reviews?: number; rating?: number }) {
  return (
    <div className="glass rounded-lg p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Feedback constructivo</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-4xl font-black text-white">{rating}</span>
        <span className="pb-1 text-sm text-muted">/ 5 · {reviews} reviews</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {dimensions.map((dimension, index) => (
          <div key={dimension} className="rounded-md bg-white/[0.04] p-3">
            <div className="flex justify-between text-sm"><span className="text-zinc-300">{dimension}</span><b className="text-white">{(4.2 + index * 0.08).toFixed(1)}</b></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventFeedbackForm() {
  const [sent, setSent] = useState(false);

  return (
    <div className="glass rounded-lg p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-pulse">Feedback evento</p>
      <h3 className="mt-2 text-xl font-black text-white">Ayuda a mejorar la fecha</h3>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {dimensions.map((dimension) => <input key={dimension} aria-label={dimension} placeholder={`${dimension} 1-5`} className="h-10 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-cyan" />)}
      </div>
      <textarea aria-label="Comentario" placeholder="Comentario corto y constructivo" className="mt-2 min-h-20 w-full rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none focus:border-cyan" />
      <button onClick={() => setSent(true)} className="mt-3 rounded-md bg-white px-4 py-2 text-sm font-black text-void">Guardar feedback local</button>
      {sent && <p className="mt-2 text-sm text-success">Feedback preparado localmente.</p>}
    </div>
  );
}
