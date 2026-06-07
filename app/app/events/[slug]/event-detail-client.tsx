"use client";

import Link from "next/link";
import { CalendarDays, Check, Eye, MapPin, Send, Star } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { DJCard } from "@/components/dj-card";
import { GenrePill } from "@/components/genre-pill";
import { Timetable } from "@/components/timetable";
import { TicketButton } from "@/components/ticket-button";
import { UserAvatar } from "@/components/user-avatar";
import { EventFeedbackForm } from "@/components/producer-feedback";
import { djs, users } from "@/lib/data";
import { formatEventDate } from "@/lib/utils";
import { useTrackState } from "@/lib/use-track-state";
import type { Event } from "@/types";

export function EventDetailClient({ event }: { event: Event }) {
  const { state, actions } = useTrackState();
  const lineup = event.lineup.map((slug) => djs.find((dj) => dj.slug === slug)).filter(Boolean);
  const attendees = event.attendees.map((id) => users.find((user) => user.id === id)).filter(Boolean);

  return (
    <div className="space-y-8">
      <section className={`min-h-64 rounded-lg bg-gradient-to-br ${event.coverTone} p-5`}>
        <div className="flex h-full min-h-56 flex-col justify-between">
          <div className="flex flex-wrap gap-2">
            {event.genres.map((genre) => <span key={genre} className="rounded-full bg-black/30 px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">{genre}</span>)}
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/75">{event.type}</p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-white md:text-6xl">{event.name}</h1>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="glass rounded-lg p-5">
            <div className="grid gap-3 text-sm text-muted sm:grid-cols-2">
              <span className="flex items-center gap-2"><CalendarDays size={17} /> {formatEventDate(event.date)} · {event.time}</span>
              <span className="flex items-center gap-2"><MapPin size={17} /> {event.city} · {event.venue}</span>
            </div>
            <p className="mt-5 leading-7 text-zinc-300">{event.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ActionButton active={state.interestedEvents.includes(event.slug)} onClick={() => actions.toggleInterestedEvent(event.slug)} icon={<Star size={16} />}>Me interesa</ActionButton>
              <ActionButton active={state.goingEvents.includes(event.slug)} onClick={() => actions.toggleGoingEvent(event.slug)} icon={<Check size={16} />}>Voy</ActionButton>
              <ActionButton active={state.attendedEvents.includes(event.slug)} onClick={() => actions.toggleAttendedEvent(event.slug)} icon={<Eye size={16} />}>Fui</ActionButton>
              <ActionButton onClick={() => navigator.clipboard?.writeText(`Voy a ${event.name} en TrackDJs`)} icon={<Send size={16} />}>Compartir</ActionButton>
              <TicketButton event={event} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Lineup clickable</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {lineup.map((dj) => dj && <Link key={dj.slug} href={`/app/djs/${dj.slug}`}><GenrePill label={dj.name} /></Link>)}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Timetable</h2>
            <div className="mt-4"><Timetable event={event} /></div>
          </div>
          {(event.date < "2026-06-06" || event.status === "finished") && <EventFeedbackForm />}
        </div>

        <aside className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">DJs del lineup</h2>
            <div className="mt-4 space-y-3">
              {lineup.map((dj) => dj && <DJCard key={dj.slug} dj={dj} compact />)}
            </div>
          </div>
          <div className="glass rounded-lg p-5">
            <h2 className="text-xl font-black text-white">Personas que van</h2>
            <div className="mt-4 flex -space-x-3">
              {attendees.map((user) => user && <UserAvatar key={user.id} name={user.alias} />)}
            </div>
            <p className="mt-4 text-sm text-muted">{attendees.length} ravers mock tienen esta noche en el radar.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
