"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CalendarDays, ListFilter, MapPin } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { GenrePill } from "@/components/genre-pill";
import { LoadingState } from "@/components/loading-state";
import { SearchBar } from "@/components/search-bar";
import type { Event } from "@/types";

const EventMap = dynamic(() => import("@/components/event-map").then((mod) => mod.EventMap), {
  ssr: false,
  loading: () => <LoadingState label="Cargando mapa GPS..." />
});

const filters = ["Todos", "Hoy", "Este mes", "Santiago", "Open Air", "Club", "Festival", "Techno", "House"];
const today = "2026-06-06";

export function EventExplorer({ events }: { events: Event[] }) {
  const [active, setActive] = useState("Todos");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (active === "Todos") return true;
      if (active === "Hoy") return event.date === today;
      if (active === "Este mes") return event.date.startsWith("2026-06");
      if (active === "Santiago") return event.city === "Santiago" || event.city === "Providencia";
      if (["Open Air", "Club", "Festival"].includes(active)) return event.type === active;
      return event.genres.includes(active);
    });
  }, [active, events]);

  const todayEvents = events.filter((event) => event.date === today);

  return (
    <div className="space-y-8">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="glass rounded-lg p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Hoy</p>
          <p className="mt-2 text-3xl font-black text-white">{todayEvents.length}</p>
          <p className="text-sm text-muted">fiestas mapeadas</p>
        </div>
        <div className="glass rounded-lg p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-pulse">Timeline</p>
          <p className="mt-2 text-3xl font-black text-white">{events.length}</p>
          <p className="text-sm text-muted">eventos para sumar/restar</p>
        </div>
        <div className="glass rounded-lg p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-success">Data</p>
          <p className="mt-2 text-3xl font-black text-white">RC</p>
          <p className="text-sm text-muted">fuentes oficiales y ticketeras</p>
        </div>
      </section>

      <EventMap events={todayEvents} />

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-muted">
          <ListFilter size={18} />
          <span className="text-sm font-bold">Filtra por fecha, ciudad, formato o estilo.</span>
        </div>
        <SearchBar placeholder="Buscar pronto por DJ, venue o productora..." />
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={active === filter}
              onClick={() => setActive(filter)}
              className={`rounded-full border px-3 py-2 text-xs font-black transition ${active === filter ? "border-cyan bg-cyan/15 text-cyan" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25"}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Linea de tiempo</h2>
            <p className="mt-1 text-sm text-muted">Base preparada para Google Calendar, alertas y timetable programable de festivales.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <Link href="/app/upcoming" className="rounded-md border border-cyan/30 bg-cyan/10 px-3 py-2 font-black text-cyan">Abrir próximas fechas</Link>
            <span className="flex items-center gap-1"><CalendarDays size={14} /> fecha</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> ciudad</span>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => <EventCard key={event.slug} event={event} />)}
        </div>
        {!filteredEvents.length && (
          <div className="glass mt-4 rounded-lg p-5 text-sm text-muted">No hay eventos para este filtro todavia. Queda listo para completar desde backend.</div>
        )}
      </section>

      <section className="glass rounded-lg p-5">
        <h2 className="text-2xl font-black text-white">Creamfields planner</h2>
        <p className="mt-2 leading-7 text-zinc-300">
          Creamfields Chile 2026 queda mapeado como festival futuro. Como el lineup aun no esta anunciado en las fuentes consultadas, el timetable queda vacio para activar en Sprint 2 con alertas, escenarios y export a Google Calendar.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <GenrePill label="Timetable programable" />
          <GenrePill label="Alertas futuras" />
          <GenrePill label="Google Calendar despues" />
        </div>
      </section>
    </div>
  );
}
