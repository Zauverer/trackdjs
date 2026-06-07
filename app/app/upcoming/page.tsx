import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CalendarPlus, Clock, MapPin, Minus, Plus } from "lucide-react";
import { getDJs, getUpcomingEvents } from "@/lib/data";
import { EmptyState } from "@/components/empty-state";
import { GenrePill } from "@/components/genre-pill";
import { TrackedLink } from "@/components/tracked-link";
import { formatEventDate } from "@/lib/utils";

const sortedEvents = getUpcomingEvents();
const djs = getDJs();

export const metadata: Metadata = {
  title: "Próximas fechas",
  description: "Agenda y línea de tiempo de próximas fiestas electrónicas en TrackDJs."
};

function lineupNames(lineup: string[]) {
  return lineup
    .map((slug) => djs.find((dj) => dj.slug === slug)?.name)
    .filter(Boolean)
    .join(" · ");
}

function monthLabel(date: string) {
  return new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export default function UpcomingPage() {
  const grouped = sortedEvents.reduce<Record<string, typeof sortedEvents>>((acc, event) => {
    const label = monthLabel(event.date);
    acc[label] = [...(acc[label] ?? []), event];
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">Próximas fechas</p>
        <h1 className="mt-2 text-4xl font-black text-white">Linea de tiempo de fiestas</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Agenda cronológica para sumar, restar y preparar tu ruta. Más adelante esto se conecta con Google Calendar y alertas por set.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="glass rounded-lg p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Agenda</p>
          <p className="mt-2 text-3xl font-black text-white">{sortedEvents.length}</p>
          <p className="text-sm text-muted">fechas cargadas</p>
        </div>
        <div className="glass rounded-lg p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-pulse">Festivales</p>
          <p className="mt-2 text-3xl font-black text-white">{sortedEvents.filter((event) => event.type === "Festival").length}</p>
          <p className="text-sm text-muted">para planner futuro</p>
        </div>
        <div className="glass rounded-lg p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-success">Alertas</p>
          <p className="mt-2 text-3xl font-black text-white">Soon</p>
          <p className="text-sm text-muted">sets y calendario</p>
        </div>
      </section>

      {!sortedEvents.length && <EmptyState title="Todavía no hay próximas fechas cargadas." href="/app/events" action="Volver a eventos" />}

      <section className="relative space-y-8">
        <div className="absolute bottom-0 left-4 top-0 hidden w-px bg-gradient-to-b from-cyan via-neon to-pulse sm:block" />
        {Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month} className="space-y-4">
            <h2 className="pl-0 text-sm font-black uppercase tracking-[0.2em] text-cyan sm:pl-10">{month}</h2>
            <div className="flex snap-x gap-4 overflow-x-auto pb-2 sm:block sm:space-y-4 sm:overflow-visible sm:pb-0">
              {monthEvents.map((event) => {
                const names = lineupNames(event.lineup);
                return (
                  <article key={event.slug} className="glass relative w-[84vw] shrink-0 snap-start rounded-lg p-4 sm:ml-10 sm:w-auto">
                    <span className="absolute -left-[49px] top-5 hidden h-4 w-4 rounded-full border-2 border-white bg-cyan shadow-cyan sm:block" />
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-void">{formatEventDate(event.date)} · {event.time}</span>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-muted">{event.type}</span>
                        </div>
                        <TrackedLink href={`/app/events/${event.slug}`} event="upcoming_event_clicked" properties={{ slug: event.slug }} className="mt-3 block text-2xl font-black text-white hover:text-cyan">
                          {event.name}
                        </TrackedLink>
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted"><MapPin size={16} /> {event.venue} · {event.city}</p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-zinc-300"><Clock size={16} /> {names || "Lineup por confirmar"}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {event.genres.map((genre) => <GenrePill key={genre} label={genre} />)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 lg:w-64">
                        <button aria-label={`Sumar ${event.name}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-bold text-white"><Plus size={16} /> Sumar</button>
                        <button aria-label={`Restar ${event.name}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-bold text-white"><Minus size={16} /> Restar</button>
                        <button aria-label={`Crear alerta para ${event.name}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan/30 bg-cyan/10 px-3 text-sm font-bold text-cyan"><Bell size={16} /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap gap-2">
        <Link href="/app/events" className="rounded-md bg-white px-4 py-2 text-sm font-black text-void hover:bg-cyan">Volver a eventos</Link>
        <Link href="/app/explore" className="rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-white hover:border-cyan/40">Explorar más</Link>
      </section>

      <section className="glass rounded-lg p-5">
        <h2 className="flex items-center gap-2 text-2xl font-black text-white"><CalendarPlus size={22} /> Próximo paso calendario</h2>
        <p className="mt-2 leading-7 text-zinc-300">
          Los botones de sumar, restar y alerta quedan como UI preparada. En Sprint 2 conectamos persistencia por usuario, conflictos de horario y exportación a Google Calendar.
        </p>
      </section>
    </div>
  );
}
