"use client";

import { Edit3, MapPin } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { BadgeCard } from "@/components/badge-card";
import { GenrePill } from "@/components/genre-pill";
import { ShareCard } from "@/components/share-card";
import { SocialLinks } from "@/components/social-links";
import { UserAvatar } from "@/components/user-avatar";
import { badges, djs, events, genres, users } from "@/lib/data";
import { useTrackState } from "@/lib/use-track-state";

export default function ProfilePage() {
  const { state } = useTrackState();
  const user = users[0];
  const followed = djs.filter((dj) => state.followedDjs.includes(dj.slug));
  const saved = events.filter((event) => state.savedEvents.includes(event.slug));
  const going = events.filter((event) => state.goingEvents.includes(event.slug));

  return (
    <div className="space-y-8">
      <section className="glass rounded-lg p-5 md:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar name={user.alias} size="lg" />
          <div className="flex-1">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">Perfil</p>
            <h1 className="mt-2 text-4xl font-black text-white">@{user.username ?? user.alias}</h1>
            <p className="mt-2 flex items-center gap-2 text-muted"><MapPin size={16} /> {user.city}, Chile</p>
            <p className="mt-4 max-w-2xl leading-7 text-zinc-300">{user.bio}</p>
            <div className="mt-4">
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
          </div>
          <ActionButton icon={<Edit3 size={16} />}>Editar perfil</ActionButton>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-lg p-5 md:col-span-2">
          <h2 className="text-2xl font-black text-white">Géneros favoritos</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {genres.filter((genre) => user.genres.includes(genre.name)).map((genre) => <GenrePill key={genre.id} label={genre.name} />)}
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <h2 className="text-2xl font-black text-white">DJs seguidos</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            {followed.length ? followed.map((dj) => <p key={dj.slug}>{dj.name}</p>) : <p className="text-muted">Sigue DJs para activar tu radar.</p>}
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <h2 className="text-2xl font-black text-white">Eventos</h2>
          <p className="mt-4 text-sm text-zinc-300">{saved.length} guardados · {going.length} marcados como Voy</p>
          <p className="mt-2 text-sm text-muted">Tu perfil social se alimenta desde Mi Track.</p>
        </div>
        </div>
        <ShareCard seen={state.seenDjs.length} events={state.attendedEvents.length} genre={user.genres[0] ?? "Techno"} />
      </section>

      <section>
        <h2 className="text-2xl font-black text-white">Badges</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.slice(0, 4).map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
        </div>
      </section>
    </div>
  );
}
