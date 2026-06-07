"use client";

import Link from "next/link";
import { Bookmark, CalendarDays, Disc3, Music2 } from "lucide-react";
import { BadgeCard } from "@/components/badge-card";
import { DJCard } from "@/components/dj-card";
import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { SectionHeader } from "@/components/section-header";
import { PageViewTracker } from "@/components/page-view-tracker";
import { ShareCard } from "@/components/share-card";
import { SocialLinks } from "@/components/social-links";
import { StatCard } from "@/components/stat-card";
import { getDJs, getEvents, getUsers } from "@/lib/data";
import { useTrackState } from "@/lib/use-track-state";

export default function MyTrackPage() {
  const { state, stats, remoteLoading, isAuthenticated } = useTrackState();
  const djs = getDJs();
  const events = getEvents();
  const user = getUsers()[0];
  const seen = djs.filter((dj) => state.seenDjs.includes(dj.slug));
  const followed = djs.filter((dj) => state.followedDjs.includes(dj.slug));
  const wantToSee = djs.filter((dj) => state.wantToSeeDjs.includes(dj.slug));
  const upcoming = events.filter((event) => state.goingEvents.includes(event.slug) || state.savedEvents.includes(event.slug));
  const attended = events.filter((event) => state.attendedEvents.includes(event.slug));

  return (
    <div className="space-y-8">
      <PageViewTracker event="my_track_opened" />
      <section className="grid gap-5 lg:grid-cols-[1fr_380px] lg:items-stretch">
        <div className="glass rounded-lg p-5 md:p-7">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">Mi Track</p>
          <h1 className="mt-2 text-5xl font-black leading-tight text-white">Tu historial electronico esta empezando.</h1>
          <p className="mt-4 max-w-2xl leading-7 text-zinc-300">Cada DJ visto suma a tu identidad de escena. Guarda fiestas, marca sets y comparte tu recorrido cuando quieras.</p>
          <p className="mt-3 text-sm font-bold text-muted">
            {isAuthenticated ? (remoteLoading ? "Sincronizando tu cuenta..." : "Sincronizado con tu cuenta TrackDJs.") : "Estás usando modo invitado. Crea cuenta para guardar tu Track entre dispositivos."}
          </p>
          {!isAuthenticated ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/signup" className="rounded-md bg-white px-4 py-2 text-sm font-black text-void">Crear cuenta</Link>
              <Link href="/login" className="rounded-md border border-cyan/30 px-4 py-2 text-sm font-bold text-cyan">Entrar</Link>
            </div>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="DJs vistos" value={stats.seenDjs} icon={<Disc3 size={18} />} />
            <StatCard label="Eventos asistidos" value={stats.attendedEvents} icon={<CalendarDays size={18} />} />
            <StatCard label="Proximos eventos" value={stats.upcomingEvents} icon={<Bookmark size={18} />} />
            <StatCard label="Genero dominante" value={stats.dominantGenre} icon={<Music2 size={18} />} />
          </div>
        </div>
        <ShareCard seen={stats.seenDjs} events={stats.attendedEvents} genre={stats.dominantGenre} />
      </section>

      <section className="glass rounded-lg p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Perfil social</p>
            <h2 className="mt-1 text-2xl font-black text-white">@{user.username ?? user.alias}</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">Tu Track también es una carta de presentación: historial, gustos, playlist y badges en un solo lugar.</p>
          </div>
          <SocialLinks
            links={{
              instagram_url: user.instagram_url,
              tiktok_url: user.tiktok_url,
              spotify_url: user.spotify_url,
              spotify_playlist_url: user.spotify_playlist_url,
              website_url: user.website_url,
            }}
            compact
          />
        </div>
      </section>

      <section>
        <SectionHeader title="DJs que vi" description="Tu historial de cabina empieza con cada set marcado." action={<Link href="/app/djs" className="text-sm font-bold text-cyan">Sumar DJ</Link>} />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {seen.length ? seen.map((dj) => <DJCard key={dj.slug} dj={dj} compact />) : <EmptyState title="Aun no marcaste DJs vistos." href="/app/djs" action="Explorar DJs" />}
        </div>
      </section>

      <section>
        <SectionHeader title="DJs seguidos" description="Tu radar activo para próximas noches." />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {followed.length ? followed.map((dj) => <DJCard key={dj.slug} dj={dj} compact />) : <EmptyState title="Todavía no sigues DJs." href="/app/djs" action="Seguir DJs" />}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black text-white">Quiero ver</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wantToSee.length ? wantToSee.map((dj) => <DJCard key={dj.slug} dj={dj} compact />) : <EmptyState title="Tu wishlist de cabina esta esperando." href="/app/djs" action="Buscar artistas" />}
        </div>
      </section>

      <section>
        <SectionHeader title="Mis proximos eventos" description="Fiestas guardadas o marcadas como Voy." />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.length ? upcoming.map((event) => <EventCard key={event.slug} event={event} />) : <EmptyState title="Todavia no guardaste eventos." href="/app/upcoming" action="Ver próximas fiestas" />}
        </div>
      </section>

      <section>
        <SectionHeader title="Eventos a los que fui" description="Tu memoria de escena, sin inflar números." />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {attended.length ? attended.map((event) => <EventCard key={event.slug} event={event} />) : <EmptyState title="Todavía no marcaste eventos como Fui." href="/app/events" action="Explorar eventos" />}
        </div>
      </section>

      <section>
        <SectionHeader title="Badges desbloqueados" description="Comparte tu recorrido. La escena tambien se construye con memoria." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.unlockedBadges.length ? stats.unlockedBadges.map((badge) => <BadgeCard key={badge.id} badge={badge} />) : <EmptyState title="Tus badges se desbloquean al seguir, ver y guardar noches." href="/app/events" action="Empezar recorrido" />}
        </div>
      </section>
    </div>
  );
}
