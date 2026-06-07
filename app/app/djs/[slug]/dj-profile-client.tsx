"use client";

import { Eye, Flag, Heart, Mail, MapPin, Star } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { ContactPanel } from "@/components/contact-panel";
import { EventCard } from "@/components/event-card";
import { GenrePill } from "@/components/genre-pill";
import { SocialLinks } from "@/components/social-links";
import { StatCard } from "@/components/stat-card";
import { UserAvatar } from "@/components/user-avatar";
import { events } from "@/lib/data";
import { countryNameToFlagEmoji } from "@/lib/country-utils";
import { useTrackState } from "@/lib/use-track-state";
import type { DJ } from "@/types";

export function DJProfileClient({ dj }: { dj: DJ }) {
  const { state, actions } = useTrackState();
  const upcoming = events.filter((event) => event.lineup.includes(dj.slug) && event.date >= "2026-06-06");
  const past = events.filter((event) => event.lineup.includes(dj.slug) && event.date < "2026-06-06");
  const cities = [...new Set([...upcoming, ...past].map((event) => event.city))];
  const contactEnabled = dj.contact_enabled ?? dj.contactEnabled ?? false;
  const flag = dj.flag ?? countryNameToFlagEmoji(dj.country);

  return (
    <div className="space-y-8">
      <section className="glass rounded-lg p-5 md:p-7">
        <div className="flex flex-col gap-5 sm:flex-row">
          <UserAvatar name={dj.name} size="lg" />
          <div className="flex-1">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">LinkedIn artístico</p>
            <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">{dj.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-muted"><Flag size={16} /> {flag} {dj.country} <MapPin size={16} /> Base: {dj.city}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {dj.genres.map((genre) => <GenrePill key={genre} label={genre} />)}
            </div>
            <p className="mt-5 max-w-2xl leading-7 text-zinc-300">{dj.bio}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <ActionButton active={state.followedDjs.includes(dj.slug)} onClick={() => actions.toggleFollow(dj.slug)} icon={<Heart size={16} />}>Seguir</ActionButton>
          <ActionButton active={state.seenDjs.includes(dj.slug)} onClick={() => actions.toggleSeen(dj.slug)} icon={<Eye size={16} />}>Lo vi</ActionButton>
          <ActionButton active={state.wantToSeeDjs.includes(dj.slug)} onClick={() => actions.toggleWantToSee(dj.slug)} icon={<Star size={16} />}>Quiero verlo</ActionButton>
          {contactEnabled ? <ActionButton icon={<Mail size={16} />}>Contactar</ActionButton> : <span className="inline-flex min-h-10 items-center rounded-md border border-white/10 px-4 text-sm font-bold text-muted">Contacto no disponible</span>}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <StatCard label="Seguidores" value={dj.followers.toLocaleString("es-CL")} />
        <StatCard label="Visto por" value={(dj.seenBy + (state.seenDjs.includes(dj.slug) ? 1 : 0)).toLocaleString("es-CL")} />
        <StatCard label="Eventos" value={upcoming.length + past.length} />
        <StatCard label="Rating sets" value={`${dj.rating}/5`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="glass rounded-lg p-5">
          <h2 className="text-2xl font-black text-white">Redes y música</h2>
          <div className="mt-4">
            <SocialLinks
              links={{
                instagram_url: dj.instagram_url ?? dj.links.instagram,
                tiktok_url: dj.tiktok_url,
                spotify_url: dj.spotify_url ?? dj.links.spotify,
                soundcloud_url: dj.soundcloud_url ?? dj.links.soundcloud,
                youtube_url: dj.youtube_url ?? dj.links.youtube,
                website_url: dj.website_url ?? dj.links.website,
              }}
              emptyText="Redes pendientes de completar."
            />
          </div>
        </div>
        <ContactPanel
          entityType="dj"
          contactEnabled={contactEnabled}
          email={dj.contact_email}
          website={dj.website_url ?? dj.links.website}
          instagram={dj.instagram_url ?? dj.links.instagram}
          tiktok={dj.tiktok_url}
        />
      </section>

      <section className="glass rounded-lg p-5">
        <h2 className="text-2xl font-black text-white">Timeline artística</h2>
        <p className="mt-2 text-sm text-muted">Ciudades mapeadas: {cities.join(" · ") || "Por mapear"}</p>
        <div className="mt-4 space-y-2 text-sm text-zinc-300">
          {[...upcoming, ...past].map((event) => <p key={event.slug}>{event.date} · {event.name} · {event.venue}</p>)}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black text-white">Próximos eventos</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.map((event) => <EventCard key={event.slug} event={event} />)}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black text-white">Eventos pasados</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {past.length ? past.map((event) => <EventCard key={event.slug} event={event} />) : <p className="text-muted">Todavía no hay eventos pasados cargados.</p>}
        </div>
      </section>
    </div>
  );
}
