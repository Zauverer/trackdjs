"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Edit3, Loader2, MapPin, Save } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { SocialLinks } from "@/components/social-links";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/components/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

const fields = [
  ["username", "Username"],
  ["display_name", "Nombre visible"],
  ["city", "Ciudad"],
  ["bio", "Bio"],
  ["instagram_url", "Instagram"],
  ["tiktok_url", "TikTok"],
  ["spotify_url", "Spotify"],
  ["spotify_playlist_url", "Playlist Spotify"],
  ["website_url", "Website"]
] as const;

export default function ProfilePage() {
  const { loading, user, profile, refreshProfile } = useSession();
  const supabase = createSupabaseBrowserClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile) return;
    setForm({
      username: profile.username ?? "",
      display_name: profile.display_name ?? "",
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
    if (!supabase || !user) return;
    setSaving(true);
    setMessage("");

    const payload: Database["public"]["Tables"]["profiles"]["Update"] = {
      username: clean(form.username),
      display_name: clean(form.display_name),
      city: clean(form.city),
      bio: clean(form.bio),
      instagram_url: clean(form.instagram_url),
      tiktok_url: clean(form.tiktok_url),
      spotify_url: clean(form.spotify_url),
      spotify_playlist_url: clean(form.spotify_playlist_url),
      website_url: clean(form.website_url),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    await refreshProfile();
    setMessage("Perfil guardado.");
  }

  if (loading) {
    return <div className="glass rounded-lg p-6 text-muted">Cargando perfil...</div>;
  }

  if (!user) {
    return (
      <section className="glass rounded-lg p-6">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">Perfil</p>
        <h1 className="mt-3 text-4xl font-black text-white">Crea tu cuenta para guardar tu Track.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">Puedes explorar sin cuenta, pero tu perfil público, redes y actividad persistente viven en tu cuenta TrackDJs.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-md bg-white px-4 py-3 text-sm font-black text-void">Crear cuenta</Link>
          <Link href="/login" className="rounded-md border border-cyan/30 px-4 py-3 text-sm font-bold text-cyan">Entrar</Link>
        </div>
      </section>
    );
  }

  const displayName = profile?.display_name ?? profile?.username ?? user.email ?? "TrackDJs";
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
          {message ? <span className="text-sm font-bold text-muted">{message}</span> : null}
        </div>
      </form>
    </div>
  );
}

function clean(value?: string) {
  const text = value?.trim();
  return text ? text : null;
}
