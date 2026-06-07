"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, Loader2, LogIn, MapPin, RefreshCw, Save } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { SocialLinks } from "@/components/social-links";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/components/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
  const { loading, error, user, profile, refreshProfile, retryAuth } = useSession();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
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
      const username = normalizeUsername(form.username) ?? usernameFromEmail(user.email);
      const payload: Database["public"]["Tables"]["profiles"]["Insert"] = {
        id: user.id,
        email: user.email ?? null,
        username,
        full_name: clean(form.full_name),
        avatar_url: profile?.avatar_url ?? null,
        city: clean(form.city),
        bio: clean(form.bio),
        instagram_url: clean(form.instagram_url),
        tiktok_url: clean(form.tiktok_url),
        spotify_url: clean(form.spotify_url),
        spotify_playlist_url: clean(form.spotify_playlist_url),
        website_url: clean(form.website_url),
        public_contact_enabled: profile?.public_contact_enabled ?? false,
        updated_at: new Date().toISOString()
      };

      const { error } = await withTimeout(
        supabase.from("profiles").upsert(payload, { onConflict: "id" }),
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
          <ActionButton icon={<Edit3 size={16} />}>Editando perfil</ActionButton>
        </div>
      </section>

      <form onSubmit={onSubmit} className="glass grid gap-4 rounded-lg p-5 md:grid-cols-2">
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
      </form>
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
