"use client";

import Link from "next/link";
import { Bookmark, CalendarDays, Check, MapPin, Star } from "lucide-react";
import type { Event } from "@/types";
import { djs } from "@/lib/data";
import { formatEventDate } from "@/lib/utils";
import { GenrePill } from "@/components/genre-pill";
import { ActionButton } from "@/components/action-button";
import { TicketButton } from "@/components/ticket-button";
import { useTrackState } from "@/lib/use-track-state";

export function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const { state, actions } = useTrackState();
  const saved = state.savedEvents.includes(event.slug);
  const going = state.goingEvents.includes(event.slug);
  const lineup = event.lineup.map((slug) => djs.find((dj) => dj.slug === slug)?.name).filter(Boolean).slice(0, 3);

  return (
    <article className="glass overflow-hidden rounded-lg">
      <Link href={`/app/events/${event.slug}`} className={`block h-32 bg-gradient-to-br ${event.coverTone} p-4`}>
        <div className="flex h-full items-end justify-between">
          <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">{event.type}</span>
          {featured && <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-void">Destacado</span>}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/app/events/${event.slug}`} className="text-xl font-black text-white hover:text-cyan">
          {event.name}
        </Link>
        <div className="mt-3 grid gap-2 text-sm text-muted">
          <span className="flex items-center gap-2"><CalendarDays size={16} /> {formatEventDate(event.date)} · {event.time}</span>
          <span className="flex items-center gap-2"><MapPin size={16} /> {event.city} · {event.venue}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {event.genres.map((genre) => <GenrePill key={genre} label={genre} />)}
        </div>
        <p className="mt-3 text-sm text-zinc-300">{lineup.length ? `Lineup: ${lineup.join(" · ")}` : "Lineup por confirmar"}</p>
        {event.dataQuality && (
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
            {event.dataQuality === "verified" ? "Verificado" : event.dataQuality === "partial" ? "Datos parciales" : "Mock"}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <TicketButton event={event} />
          <ActionButton active={saved} onClick={() => actions.toggleSavedEvent(event.slug)} icon={<Bookmark size={15} />} className="px-2">
            {saved ? "Guardado" : "Guardar"}
          </ActionButton>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <ActionButton active={going} onClick={() => actions.toggleGoingEvent(event.slug)} icon={going ? <Check size={15} /> : <Star size={15} />} className="px-2">
            Voy
          </ActionButton>
          <ActionButton active={state.interestedEvents.includes(event.slug)} onClick={() => actions.toggleInterestedEvent(event.slug)} className="px-2">
            Interesa
          </ActionButton>
        </div>
      </div>
    </article>
  );
}
