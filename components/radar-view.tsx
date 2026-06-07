"use client";

import dynamic from "next/dynamic";
import { SlidersHorizontal, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import type { Event } from "@/types";
import { CompactEventCard } from "@/components/compact-event-card";
import { FilterChips } from "@/components/filter-chips";
import { LoadingState } from "@/components/loading-state";
import { SearchBar } from "@/components/search-bar";

const EventMap = dynamic(() => import("@/components/event-map").then((mod) => mod.EventMap), {
  ssr: false,
  loading: () => <LoadingState label="Cargando mapa..." />
});

const filters = ["Todos", "Hoy", "Esta semana", "Este mes", "Techno", "House", "Open Air", "Club", "Festival", "Cerca de mí"];
const today = "2026-06-06";

function matchesFilter(event: Event, active: string) {
  if (active === "Todos") return true;
  if (active === "Hoy") return event.date === today;
  if (active === "Esta semana") return event.date >= today && event.date <= "2026-06-13";
  if (active === "Este mes") return event.date.startsWith("2026-06");
  if (active === "Cerca de mí") return event.city === "Santiago" || event.city === "Providencia";
  if (["Open Air", "Club", "Festival"].includes(active)) return event.type === active;
  return event.genres.includes(active);
}

export function RadarView({ events, title = "Eventos cerca de ti" }: { events: Event[]; title?: string }) {
  const [active, setActive] = useState("Todos");
  const [view, setView] = useState<"map" | "list">("map");

  const filtered = useMemo(() => events.filter((event) => matchesFilter(event, active)), [active, events]);

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Santiago radar</p>
          <h1 className="truncate text-2xl font-black text-white md:text-3xl">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button aria-label="Filtros" className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-white"><SlidersHorizontal size={18} /></button>
          <a href="/app/profile" aria-label="Perfil" className="grid h-10 w-10 place-items-center rounded-full bg-white text-void"><UserRound size={18} /></a>
        </div>
      </section>

      <SearchBar placeholder="Filtrar por DJ, comuna, venue o productora..." />
      <FilterChips filters={filters} active={active} onChange={setActive} />

      <div className="grid grid-cols-2 gap-2 md:hidden">
        <button onClick={() => setView("map")} className={`rounded-md px-3 py-2 text-sm font-black ${view === "map" ? "bg-white text-void" : "border border-white/10 text-white"}`}>Mapa</button>
        <button onClick={() => setView("list")} className={`rounded-md px-3 py-2 text-sm font-black ${view === "list" ? "bg-white text-void" : "border border-white/10 text-white"}`}>Lista</button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[390px_1fr]">
        <div className={`${view === "map" ? "hidden md:block" : "block"} space-y-3 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1`}>
          {filtered.map((event) => <CompactEventCard key={event.slug} event={event} />)}
          {!filtered.length && <div className="glass rounded-lg p-4 text-sm text-muted">No hay eventos para este filtro.</div>}
        </div>
        <div className={`${view === "list" ? "hidden md:block" : "block"}`}>
          <EventMap events={filtered} showList={false} />
        </div>
      </section>
    </div>
  );
}
