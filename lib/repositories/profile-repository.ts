import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export type ProfileInput = {
  username?: string;
  display_name?: string;
  city?: string;
  bio?: string;
  favorite_genres?: string[];
};

export async function getCurrentProfile() {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseBrowserClient();
  const { data: auth } = await supabase!.auth.getUser();
  if (!auth.user) return null;

  const { data } = await supabase!.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
  return data ?? null;
}

export async function updateProfile(input: ProfileInput) {
  if (!isSupabaseConfigured()) return { ok: false, reason: "Supabase is not configured", input };

  const supabase = createSupabaseBrowserClient();
  const { data: auth } = await supabase!.auth.getUser();
  if (!auth.user) return { ok: false, reason: "No authenticated user" };

  const { error } = await supabase!.from("profiles").update(input).eq("id", auth.user.id);
  return { ok: !error, error };
}
