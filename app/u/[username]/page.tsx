import type { Metadata } from "next";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { BadgeCard } from "@/components/badge-card";
import { ShareCard } from "@/components/share-card";
import { SocialLinks, type SocialLinkSet } from "@/components/social-links";
import { UserAvatar } from "@/components/user-avatar";
import { getBadges, getDJs, getEvents, getUsers } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Perfil público",
  description: "Perfil público de TrackDJs."
};

export default async function PublicUserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: profile } = await supabase!
      .from("profiles")
      .select("*")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (!profile) {
      return <PublicProfileMissing username={username} />;
    }

    const { count: seenCount } = await supabase!
      .from("user_seen_djs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);

    const { count: attendedCount } = await supabase!
      .from("user_event_status")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("status", "attended");

    const { data: seenRows } = await supabase!
      .from("user_seen_djs")
      .select("djs(slug, artist_name)")
      .eq("user_id", profile.id)
      .limit(6);

    const { data: attendedRows } = await supabase!
      .from("user_event_status")
      .select("events(slug, name)")
      .eq("user_id", profile.id)
      .eq("status", "attended")
      .limit(3);

    return (
      <PublicProfileShell
        username={profile.username ?? username}
        name={profile.full_name ?? profile.display_name ?? profile.username ?? username}
        city={profile.city}
        bio={profile.bio}
        social={{
          instagram_url: profile.instagram_url ?? undefined,
          tiktok_url: profile.tiktok_url ?? undefined,
          spotify_url: profile.spotify_url ?? undefined,
          spotify_playlist_url: profile.spotify_playlist_url ?? undefined,
          website_url: profile.website_url ?? undefined,
        }}
        seenCount={seenCount ?? 0}
        attendedCount={attendedCount ?? 0}
        seenDjs={normalizeSeenRows(seenRows)}
        attendedEvents={normalizeAttendedRows(attendedRows)}
      />
    );
  }

  const user = getUsers().find((item) => (item.username ?? item.alias).toLowerCase() === username.toLowerCase()) ?? getUsers()[0];
  return (
    <PublicProfileShell
      username={user.username ?? user.alias}
      name={user.alias}
      city={user.city}
      bio={user.bio}
      social={{
        instagram_url: user.instagram_url,
        tiktok_url: user.tiktok_url,
        spotify_url: user.spotify_url,
        spotify_playlist_url: user.spotify_playlist_url,
        website_url: user.website_url,
      }}
      seenCount={getDJs().slice(0, 6).length}
      attendedCount={getEvents().slice(0, 3).length}
      seenDjs={getDJs().slice(0, 6).map((dj) => ({ slug: dj.slug, name: dj.name }))}
      attendedEvents={getEvents().slice(0, 3).map((event) => ({ slug: event.slug, name: event.name, venue: event.venue }))}
    />
  );
}

function PublicProfileMissing({ username }: { username: string }) {
  return (
    <div className="min-h-screen px-4 py-6">
      <main className="mx-auto max-w-2xl">
        <section className="glass rounded-lg p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Perfil público</p>
          <h1 className="mt-3 text-4xl font-black text-white">@{username} no está disponible</h1>
          <p className="mt-3 text-muted">Ese perfil todavía no existe o cambió de username. Vuelve a TrackDJs para seguir explorando la escena.</p>
          <Link href="/app" className="mt-6 inline-flex rounded-md bg-white px-4 py-3 text-sm font-black text-void">Volver al radar</Link>
        </section>
      </main>
    </div>
  );
}

function PublicProfileShell({
  username,
  name,
  city,
  bio,
  social,
  seenCount,
  attendedCount,
  seenDjs,
  attendedEvents
}: {
  username: string;
  name: string;
  city: string | null;
  bio: string | null | undefined;
  social: SocialLinkSet;
  seenCount: number;
  attendedCount: number;
  seenDjs: { slug: string; name: string }[];
  attendedEvents: { slug: string; name: string; venue?: string }[];
}) {
  const badges = getBadges().slice(0, 4);

  return (
    <div className="min-h-screen px-4 py-6">
      <main className="mx-auto max-w-5xl space-y-6">
        <section className="glass rounded-lg p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <UserAvatar name={name} size="lg" />
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Perfil público</p>
              <h1 className="mt-2 text-4xl font-black text-white">@{username}</h1>
              <p className="mt-2 text-muted">{city ?? "Escena global"}</p>
              <p className="mt-3 max-w-2xl text-zinc-300">{bio ?? "DJs vistos, badges y eventos asistidos en TrackDJs."}</p>
              <div className="mt-4">
                <SocialLinks links={social} compact />
              </div>
            </div>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black text-void"><Share2 size={16} /> Compartir perfil</button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="glass rounded-lg p-4">
              <h2 className="text-2xl font-black text-white">DJs vistos</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {seenDjs.length ? seenDjs.map((dj) => <Link key={dj.slug} href={`/app/djs/${dj.slug}`} className="rounded-full border border-white/10 px-3 py-2 text-sm font-bold text-zinc-200">{dj.name}</Link>) : <p className="text-sm text-muted">Todavía no hay DJs públicos.</p>}
              </div>
            </div>
            <div className="glass rounded-lg p-4">
              <h2 className="text-2xl font-black text-white">Eventos asistidos</h2>
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                {attendedEvents.length ? attendedEvents.map((event) => <p key={event.slug}>{event.name}{event.venue ? ` · ${event.venue}` : ""}</p>) : <p className="text-muted">Todavía no hay eventos públicos.</p>}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
            </div>
          </div>
          <ShareCard seen={seenCount} events={attendedCount} genre="Techno" />
        </section>
      </main>
    </div>
  );
}

function normalizeSeenRows(rows: unknown) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const record = row as { djs?: unknown };
      const dj = Array.isArray(record.djs) ? record.djs[0] : record.djs;
      const djRecord = dj as { slug?: unknown; artist_name?: unknown } | undefined;
      return djRecord?.slug && djRecord?.artist_name ? { slug: String(djRecord.slug), name: String(djRecord.artist_name) } : null;
    })
    .filter(Boolean) as { slug: string; name: string }[];
}

function normalizeAttendedRows(rows: unknown) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const record = row as { events?: unknown };
      const event = Array.isArray(record.events) ? record.events[0] : record.events;
      const eventRecord = event as { slug?: unknown; name?: unknown } | undefined;
      return eventRecord?.slug && eventRecord?.name ? { slug: String(eventRecord.slug), name: String(eventRecord.name) } : null;
    })
    .filter(Boolean) as { slug: string; name: string }[];
}
