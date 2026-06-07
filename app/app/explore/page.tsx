import type { Metadata } from "next";
import { Building2, MapPin, Music2, Radio } from "lucide-react";
import { DJCard } from "@/components/dj-card";
import { GenrePill } from "@/components/genre-pill";
import { SearchBar } from "@/components/search-bar";
import { getDJs, getGenres, getProducers, getVenues } from "@/lib/data";

export const metadata: Metadata = {
  title: "Explorar",
  description: "Descubre DJs, productoras, venues y géneros electrónicos."
};

const filters = ["Santiago", "Valparaiso", "Techno", "Melodic Techno", "Open Air", "Club", "Festival"];

export default function ExplorePage() {
  const djs = getDJs();
  const genres = getGenres();
  const producers = getProducers();
  const venues = getVenues();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">Explorar</p>
        <h1 className="mt-2 text-4xl font-black text-white">Encuentra tu proxima obsesion</h1>
        <p className="mt-2 text-muted">Busca por ciudad, genero, venue o energia de noche.</p>
      </section>
      <SearchBar />
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => <GenrePill key={filter} label={filter} />)}
      </div>

      <section>
        <h2 className="flex items-center gap-2 text-2xl font-black text-white"><Radio size={22} /> DJs populares</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {djs.slice(0, 6).map((dj) => <DJCard key={dj.slug} dj={dj} compact />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-xl font-black text-white"><Building2 size={20} /> Productoras</h2>
          <div className="mt-4 space-y-3">
            {producers.map((producer) => (
              <div key={producer.slug} className="rounded-md bg-white/[0.04] p-3">
                <div className="font-bold text-white">{producer.name}</div>
                <div className="text-sm text-muted">{producer.city} · {producer.signature}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-xl font-black text-white"><MapPin size={20} /> Venues</h2>
          <div className="mt-4 space-y-3">
            {venues.map((venue) => (
              <div key={venue.slug} className="rounded-md bg-white/[0.04] p-3">
                <div className="font-bold text-white">{venue.name}</div>
                <div className="text-sm text-muted">{venue.city} · {venue.type}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-xl font-black text-white"><Music2 size={20} /> Generos</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {genres.map((genre) => <GenrePill key={genre.id} label={genre.name} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
