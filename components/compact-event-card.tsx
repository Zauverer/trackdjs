"use client";

import Link from "next/link";
import { Bookmark, Check, Clock, MapPin, Star } from "lucide-react";
import type { Event } from "@/types";
import { formatEventDate } from "@/lib/utils";
import { eventComuna, getEventLineupNames } from "@/lib/event-utils";
import { GenrePill } from "@/components/genre-pill";
import { TicketButton } from "@/components/ticket-button";
import { ActionButton } from "@/components/action-button";
import { useTrackState } from "@/lib/use-track-state";

export function CompactEventCard({ event }: { event: Event }) {
  const { state, actions } = useTrackState();
  const saved = state.savedEvents.includes(event.slug);
  const going = state.goingEvents.includes(event.slug);
  const lineup = getEventLineupNames(event);

  return (
    <article className="glass rounded-lg p-3">
      <div className="flex gap-3">
        <Link href={`/app/events/${event.slug}`} className={`h-20 w-20 shrink-0 rounded-md bg-gradient-to-br ${event.coverTone}`} aria-label={event.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/app/events/${event.slug}`} className="line-clamp-2 text-base font-black leading-tight text-white hover:text-cyan">{event.name}</Link>
            <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[10px] font-black text-muted">{event.type}</span>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted"><Clock size={13} /> {formatEventDate(event.date)} · {event.time}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin size={13} /> {eventComuna(event)} · {event.venue}</p>
          <p className="mt-1 truncate text-xs text-zinc-300">{lineup || "Lineup por confirmar"}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {event.genres.slice(0, 2).map((genre) => <GenrePill key={genre} label={genre} className="px-2 py-0.5 text-[10px]" />)}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <TicketButton event={event} compact />
        <ActionButton active={saved} onClick={() => actions.toggleSavedEvent(event.slug)} icon={<Bookmark size={14} />} className="min-h-10 px-2 text-xs">{saved ? "Guardado" : "Guardar"}</ActionButton>
        <ActionButton active={going} onClick={() => actions.toggleGoingEvent(event.slug)} icon={going ? <Check size={14} /> : <Star size={14} />} className="min-h-10 px-2 text-xs">Voy</ActionButton>
      </div>
    </article>
  );
}
