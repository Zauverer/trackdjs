import type { User } from "@supabase/supabase-js";
import type { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseClient =
  | NonNullable<ReturnType<typeof createSupabaseBrowserClient>>
  | NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

export function usernameFromEmail(email?: string | null) {
  const base = (email?.split("@")[0] ?? "track")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);

  return base || "track";
}

export async function ensureProfile(supabase: SupabaseClient, user: User) {
  const email = user.email ?? null;
  const metadata = user.user_metadata ?? {};
  const displayName = stringOrNull(metadata.full_name) ?? stringOrNull(metadata.name) ?? usernameFromEmail(email);
  const avatarUrl = stringOrNull(metadata.avatar_url) ?? stringOrNull(metadata.picture);

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const username = existing?.username ?? await uniqueUsername(supabase, usernameFromEmail(email), user.id);

  const profile = {
    id: user.id,
    email,
    username,
    display_name: existing?.display_name ?? displayName,
    avatar_url: existing?.avatar_url ?? avatarUrl,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });

  if (error && error.message.toLowerCase().includes("email")) {
    const { email: _email, ...fallbackProfile } = profile;
    void _email;
    const fallback = await supabase.from("profiles").upsert(fallbackProfile, { onConflict: "id" });
    if (fallback.error) throw fallback.error;
  } else if (error) {
    throw error;
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}

async function uniqueUsername(supabase: SupabaseClient, base: string, userId: string) {
  let candidate = base;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();

    if (!data || data.id === userId) return candidate;
    candidate = `${base}_${Math.random().toString(36).slice(2, 6)}`;
  }

  return `${base}_${Date.now().toString(36).slice(-5)}`;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
