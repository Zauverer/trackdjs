import type { Metadata } from "next";
import { DJCard } from "@/components/dj-card";
import { SearchBar } from "@/components/search-bar";
import { getDJs } from "@/lib/data";

export const metadata: Metadata = {
  title: "DJs",
  description: "Explora DJs, síguelos y marca artistas vistos en TrackDJs."
};

export default function DJsPage() {
  const djs = getDJs();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">DJs</p>
        <h1 className="mt-2 text-4xl font-black text-white">Artistas que definen noches</h1>
        <p className="mt-2 text-muted">Sigue, marca como visto y arma tu mapa personal de cabina.</p>
      </section>
      <SearchBar placeholder="Buscar DJ o genero..." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {djs.map((dj) => <DJCard key={dj.slug} dj={dj} />)}
      </section>
    </div>
  );
}
