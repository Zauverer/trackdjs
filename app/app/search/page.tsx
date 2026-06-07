import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CalendarDays, Factory, Music2 } from "lucide-react";
import { CompactEventCard } from "@/components/compact-event-card";
import { DJCard } from "@/components/dj-card";
import { GenrePill } from "@/components/genre-pill";
import { SearchBar } from "@/components/search-bar";
import { getDJs, getEvents, getProducers, getVenues } from "@/lib/data";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Búsqueda avanzada de eventos, DJs, venues y productoras."
};

const filters = ["Fecha", "DJ", "Estilo", "Comuna", "Venue", "Productora", "Club", "Festival", "Entrada disponible"];

export default function SearchPage() {
  const events = getEvents();
  const djs = getDJs();
  const venues = getVenues();
  const producers = getProducers();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Buscar</p>
        <h1 className="mt-2 text-3xl font-black text-white">Encuentra la próxima fecha</h1>
      </section>
      <SearchBar placeholder="DJ, estilo, comuna, venue o productora..." />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => <GenrePill key={filter} label={filter} />)}
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-black text-white"><CalendarDays size={20} /> Eventos</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {events.slice(0, 6).map((event) => <CompactEventCard key={event.slug} event={event} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-black text-white"><Music2 size={20} /> DJs</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {djs.slice(0, 6).map((dj) => <DJCard key={dj.slug} dj={dj} compact />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-black text-white"><Building2 size={20} /> Venues</h2>
          <div className="grid gap-3">
            {venues.slice(0, 5).map((venue) => {
              const upcomingCount = events.filter((event) => event.venue === venue.name || event.venue_id === venue.slug).length;
              const hasSocial = Boolean(venue.instagram_url ?? venue.instagramUrl ?? venue.tiktok_url ?? venue.website_url ?? venue.websiteUrl);
              return (
              <Link key={venue.slug} href={`/app/venues/${venue.slug}`} className="glass rounded-lg p-4 hover:border-cyan/30">
                <b className="text-white">{venue.name}</b>
                <p className="mt-1 text-sm text-muted">{venue.comuna ?? venue.city} · {venue.type}</p>
                <p className="mt-2 text-xs font-bold text-zinc-400">{upcomingCount} próximas fechas · {hasSocial ? "redes visibles" : "redes pendientes"} · {venue.contact_email ? "contacto disponible" : "contacto pendiente"}</p>
              </Link>
            );})}
          </div>
        </div>
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-black text-white"><Factory size={20} /> Productoras</h2>
          <div className="grid gap-3">
            {producers.map((producer) => {
              const upcomingCount = events.filter((event) => event.producer_id === producer.slug).length;
              const hasSocial = Boolean(producer.instagram_url ?? producer.instagramUrl ?? producer.tiktok_url ?? producer.website_url ?? producer.websiteUrl);
              return (
              <Link key={producer.slug} href={`/app/producers/${producer.slug}`} className="glass rounded-lg p-4 hover:border-cyan/30">
                <b className="text-white">{producer.name}</b>
                <p className="mt-1 text-sm text-muted">{producer.city} · {producer.signature}</p>
                <p className="mt-2 text-xs font-bold text-zinc-400">{upcomingCount} eventos · {hasSocial ? "redes visibles" : "redes pendientes"} · {producer.contact_email ? "contacto disponible" : "contacto pendiente"}</p>
              </Link>
            );})}
          </div>
        </div>
      </section>
    </div>
  );
}
