"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bookmark, CalendarDays, Disc3, Edit3, Eye, Heart, Loader2, LogIn, LogOut, MapPin, RefreshCw, Save, Star } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { SectionHeader } from "@/components/section-header";
import { SocialLinks } from "@/components/social-links";
import { StatCard } from "@/components/stat-card";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/components/auth-provider";
import { DJCard } from "@/components/dj-card";
import { EventCard } from "@/components/event-card";
import { getDJs, getEvents } from "@/lib/data";
import { getUniqueCountryFlagsFromSeenDjs } from "@/lib/country-utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useTrackState } from "@/lib/use-track-state";
import {
  isValidUsernameSlug,
  normalizeInstagramUrl,
  normalizeSpotifyPlaylistUrl,
  normalizeSpotifyUrl,
  normalizeTikTokUrl,
  normalizeWebsiteUrl
} from "@/lib/social-url-utils";
import type { Database } from "@/lib/supabase/types";

const fields = [
  ["username", "Username"],
  ["full_name", "Nombre visible"],
  ["city", "Ciudad"],
  ["bio", "Bio"],
  ["instagram_url", "Instagram"],
  ["tiktok_url", "TikTok"],
  ["spotify_url", "Spotify"],
  ["spotify_playlist_url", "Playlist Spotify"],
  ["website_url", "Website"]
] as const;

export default function ProfilePage() {
  const { loading, error, user, profile, refreshProfile, retryAuth, logout } = useSession();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { state, stats, remoteLoading, isAuthenticated } = useTrackState();
  const [tab, setTab] = useState<"summary" | "edit" | "activity" | "settings">("summary");
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      username: profile.username ?? "",
      full_name: profile.full_name ?? profile.display_name ?? "",
      city: profile.city ?? "",
      bio: profile.bio ?? "",
      instagram_url: profile.instagram_url ?? "",
      tiktok_url: profile.tiktok_url ?? "",
      spotify_url: profile.spotify_url ?? "",
      spotify_playlist_url: profile.spotify_playlist_url ?? "",
      website_url: profile.website_url ?? ""
    });
  }, [profile]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) {
      setStatus({ type: "error", text: "Necesitas iniciar sesión para guardar tu perfil." });
      return;
    }
    setSaving(true);
    setStatus(null);

    try {
      const rawUsername = form.username?.trim() || usernameFromEmail(user.email);
      const username = normalizeUsername(rawUsername);
      if (!username || !isValidUsernameSlug(rawUsername)) {
        setStatus({ type: "error", text: "El username no debe ser una URL. Usa solo letras, números o guiones." });
        return;
      }

      const normalizedLinks = {
        instagram_url: normalizeInstagramUrl(form.instagram_url),
        tiktok_url: normalizeTikTokUrl(form.tiktok_url),
        spotify_url: normalizeSpotifyUrl(form.spotify_url),
        spotify_playlist_url: normalizeSpotifyPlaylistUrl(form.spotify_playlist_url),
        website_url: normalizeWebsiteUrl(form.website_url)
      };
      const invalidSocialField = Object.entries(normalizedLinks).find(([key, value]) => Boolean(form[key]?.trim()) && !value);
      if (invalidSocialField) {
        setStatus({ type: "error", text: "Revisa tus links sociales. Usa un usuario válido o una URL completa." });
        return;
      }

      const payload: Database["public"]["Tables"]["profiles"]["Insert"] = {
        id: user.id,
        email: user.email ?? null,
        username,
        full_name: clean(form.full_name),
        avatar_url: profile?.avatar_url ?? null,
        city: clean(form.city),
        bio: clean(form.bio),
        ...normalizedLinks,
        public_contact_enabled: profile?.public_contact_enabled ?? false,
        updated_at: new Date().toISOString()
      };

      const { error } = await withTimeout(
        supabase.from("profiles").upsert([payload], { onConflict: "id" }),
        12000
      );

      if (error) {
        console.error("Profile save error", error);
        setStatus({ type: "error", text: friendlyProfileError(error.message) });
        return;
      }

      try {
        await withTimeout(refreshProfile(), 8000);
      } catch (error) {
        console.error("Profile refresh error", error);
      }

      setForm((current) => ({ ...current, username }));
      setStatus({ type: "success", text: "Perfil guardado." });
    } catch (error) {
      console.error("Profile save error", error);
      setStatus({ type: "error", text: "No pudimos guardar tu perfil. Intenta nuevamente." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ProfileStateCard
        title={user ? "Cargando perfil..." : "Cargando sesión..."}
        description="Estamos validando tu sesión de TrackDJs con Supabase."
        loading
      />
    );
  }

  if (error) {
    return (
      <ProfileStateCard
        title="Error al cargar perfil"
        description={error}
        retryAuth={retryAuth}
      />
    );
  }

  if (!user) {
    return (
      <section className="glass rounded-lg p-6">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">Perfil</p>
        <h1 className="mt-3 text-4xl font-black text-white">Entra para editar tu perfil.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">Puedes explorar sin cuenta, pero tu perfil público, redes y actividad persistente viven en tu cuenta TrackDJs.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-md bg-white px-4 py-3 text-sm font-black text-void">Entrar</Link>
          <Link href="/app" className="rounded-md border border-cyan/30 px-4 py-3 text-sm font-bold text-cyan">Explorar TrackDJs</Link>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <ProfileStateCard
        title="Error al cargar perfil"
        description="Tu sesión existe, pero no pudimos crear o leer tu perfil. Reintenta o vuelve a entrar."
        retryAuth={retryAuth}
      />
    );
  }

  const displayName = profile?.full_name ?? profile?.display_name ?? profile?.username ?? user.email ?? "TrackDJs";
  const username = profile?.username ?? "track";
  const djs = getDJs();
  const events = getEvents();
  const seenDjs = djs.filter((dj) => state.seenDjs.includes(dj.slug));
  const followedDjs = djs.filter((dj) => state.followedDjs.includes(dj.slug));
  const wantToSeeDjs = djs.filter((dj) => state.wantToSeeDjs.includes(dj.slug));
  const savedEvents = events.filter((event) => state.savedEvents.includes(event.slug));
  const goingEvents = events.filter((event) => state.goingEvents.includes(event.slug));
  const attendedEvents = events.filter((event) => state.attendedEvents.includes(event.slug));
  const countryFlags = getUniqueCountryFlagsFromSeenDjs(seenDjs);

  return (
    <div className="space-y-8">
      <section className="glass rounded-lg p-5 md:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar name={displayName} size="lg" />
          <div className="flex-1">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">Perfil</p>
            <h1 className="mt-2 text-4xl font-black text-white">@{username}</h1>
            <p className="mt-2 flex items-center gap-2 text-muted"><MapPin size={16} /> {profile?.city ?? "Ciudad por definir"}</p>
            <p className="mt-4 max-w-2xl leading-7 text-zinc-300">{profile?.bio ?? "Completa tu bio para compartir tu identidad electrónica."}</p>
            <div className="mt-4">
              <SocialLinks
                links={{
                  instagram_url: profile?.instagram_url ?? undefined,
                  tiktok_url: profile?.tiktok_url ?? undefined,
                  spotify_url: profile?.spotify_url ?? undefined,
                  spotify_playlist_url: profile?.spotify_playlist_url ?? undefined,
                  website_url: profile?.website_url ?? undefined,
                }}
                compact
              />
            </div>
          </div>
          <ActionButton onClick={() => setTab("edit")} icon={<Edit3 size={16} />}>Editar perfil</ActionButton>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          ["summary", "Resumen"],
          ["edit", "Editar perfil"],
          ["activity", "Actividad"],
          ["settings", "Configuración"]
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`shrink-0 rounded-md border px-4 py-2 text-sm font-black ${tab === key ? "border-cyan/50 bg-cyan/10 text-cyan" : "border-white/10 text-muted hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "summary" ? (
        <section className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <StatCard label="DJs vistos" value={stats.seenDjs} icon={<Eye size={18} />} />
            <StatCard label="Eventos guardados" value={stats.savedEvents} icon={<Bookmark size={18} />} />
            <StatCard label="Voy" value={stats.goingEvents} icon={<CalendarDays size={18} />} />
            <StatCard label="Asistidos" value={stats.attendedEvents} icon={<Disc3 size={18} />} />
            <StatCard label="Siguiendo" value={stats.followedDjs} icon={<Heart size={18} />} />
            <StatCard label="Quiero ver" value={state.wantToSeeDjs.length} icon={<Star size={18} />} />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="glass rounded-lg p-5">
              <SectionHeader title="Panel personal" description={remoteLoading ? "Sincronizando actividad..." : isAuthenticated ? "Tus acciones están conectadas a Supabase." : "Modo invitado con localStorage."} />
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/u/${username}`} className="rounded-md bg-white px-4 py-3 text-sm font-black text-void">Ver perfil público</Link>
                <Link href="/app/my-track" className="rounded-md border border-cyan/30 px-4 py-3 text-sm font-bold text-cyan">Mi Track</Link>
                <button onClick={() => setTab("edit")} className="rounded-md border border-white/10 px-4 py-3 text-sm font-bold text-white">Editar perfil</button>
              </div>
              <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Países donde viste DJs</p>
                <p className="mt-3 text-3xl">{countryFlags.join(" ") || "🇨🇱"}</p>
              </div>
            </div>
            <div className="glass rounded-lg p-5">
              <h2 className="text-xl font-black text-white">Acciones recientes</h2>
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <p>{seenDjs[0] ? `Viste a ${seenDjs[0].name}` : "Marca tu primer DJ visto."}</p>
                <p>{goingEvents[0] ? `Vas a ${goingEvents[0].name}` : "Marca un evento como Voy."}</p>
                <p>{savedEvents[0] ? `Guardaste ${savedEvents[0].name}` : "Guarda una fecha en tu radar."}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "edit" ? <form onSubmit={onSubmit} className="glass grid gap-4 rounded-lg p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-black text-white">Datos reales de tu perfil</h2>
          <p className="mt-2 text-sm text-muted">Estos datos se guardan en Supabase y alimentan tu perfil público.</p>
        </div>
        {fields.map(([key, label]) => (
          <label key={key} className={key === "bio" ? "md:col-span-2" : ""}>
            <span className="text-sm font-bold text-white">{label}</span>
            {key === "bio" ? (
              <textarea value={form[key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-2 min-h-28 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan" />
            ) : (
              <input value={form[key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-2 h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan" />
            )}
          </label>
        ))}
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <button disabled={saving} type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 font-black text-void disabled:opacity-60">
            {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Guardar perfil
          </button>
          <Link href={`/u/${username}`} className="text-sm font-bold text-cyan">Ver perfil público</Link>
          {status ? (
            <span className={`text-sm font-bold ${status.type === "success" ? "text-success" : "text-pulse"}`}>
              {status.text}
            </span>
          ) : null}
        </div>
      </form> : null}

      {tab === "activity" ? (
        <section className="space-y-6">
          <SectionHeader title="Actividad" description="Resumen de tus DJs, wishlist y eventos." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {seenDjs.slice(0, 3).map((dj) => <DJCard key={dj.slug} dj={dj} compact />)}
            {followedDjs.slice(0, 3).map((dj) => <DJCard key={dj.slug} dj={dj} compact />)}
            {wantToSeeDjs.slice(0, 3).map((dj) => <DJCard key={dj.slug} dj={dj} compact />)}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...savedEvents, ...goingEvents, ...attendedEvents].slice(0, 6).map((event, index) => <EventCard key={`${event.slug}-${index}`} event={event} />)}
          </div>
        </section>
      ) : null}

      {tab === "settings" ? (
        <section className="glass rounded-lg p-5">
          <h2 className="text-2xl font-black text-white">Configuración</h2>
          <p className="mt-2 text-sm text-muted">Controles básicos de cuenta para esta beta.</p>
          <button onClick={logout} className="mt-5 inline-flex items-center gap-2 rounded-md border border-pulse/30 px-4 py-3 text-sm font-black text-pulse">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </section>
      ) : null}
    </div>
  );
}

function ProfileStateCard({
  title,
  description,
  loading,
  retryAuth
}: {
  title: string;
  description: string;
  loading?: boolean;
  retryAuth?: () => void;
}) {
  return (
    <section className="glass rounded-lg p-6">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">Perfil</p>
      <h1 className="mt-3 flex items-center gap-3 text-4xl font-black text-white">
        {loading ? <Loader2 className="animate-spin text-cyan" size={26} /> : null}
        {title}
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted">{description}</p>
      {!loading ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {retryAuth ? (
            <button onClick={retryAuth} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-black text-void">
              <RefreshCw size={16} /> Reintentar
            </button>
          ) : null}
          <Link href="/login" className="inline-flex items-center gap-2 rounded-md border border-cyan/30 px-4 py-3 text-sm font-bold text-cyan">
            <LogIn size={16} /> Volver a entrar
          </Link>
          <Link href="/app" className="rounded-md border border-white/10 px-4 py-3 text-sm font-bold text-white">Explorar TrackDJs</Link>
        </div>
      ) : null}
    </section>
  );
}

function clean(value?: string) {
  const text = value?.trim();
  return text ? text : null;
}

function normalizeUsername(value?: string) {
  const text = value
    ?.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);

  return text || null;
}

function usernameFromEmail(email?: string | null) {
  return normalizeUsername(email?.split("@")[0]) ?? `track_${Date.now().toString(36).slice(-5)}`;
}

function friendlyProfileError(message: string) {
  const text = message.toLowerCase();
  if (text.includes("duplicate") || text.includes("unique") || text.includes("profiles_username")) {
    return "Ese username ya está ocupado. Prueba con otro.";
  }
  if (text.includes("row-level security") || text.includes("permission")) {
    return "No pudimos guardar por permisos de perfil. Revisa la sesión e intenta nuevamente.";
  }
  if (text.includes("column") || text.includes("schema cache")) {
    return "Falta actualizar las columnas de perfil en Supabase. Ejecuta el SQL de fix.";
  }
  return "No pudimos guardar tu perfil. Intenta nuevamente.";
}

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error("profile_save_timeout")), timeoutMs);
    })
  ]);
}
