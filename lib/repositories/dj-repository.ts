import { getDJBySlug as getMockDJBySlug, getDJs as getMockDJs } from "@/lib/data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { trackEvent } from "@/lib/analytics";
import { supabaseDJToDJ, type SupabaseDJRow } from "@/lib/adapters/supabase-adapters";

export async function getDJs() {
  if (!isSupabaseConfigured()) return getMockDJs();

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase!.from("djs").select("*").order("artist_name");
  if (error || !data) return getMockDJs();

  return (data as SupabaseDJRow[]).map(supabaseDJToDJ);
}

export async function getDJBySlug(slug: string) {
  if (!isSupabaseConfigured()) return getMockDJBySlug(slug);

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase!.from("djs").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return getMockDJBySlug(slug);

  return supabaseDJToDJ(data as SupabaseDJRow);
}

export const listDJs = getDJs;
export const getDJBySlugRepository = getDJBySlug;

export async function followDJ(djId: string) {
  trackEvent("dj_followed", { djId });
}

export async function unfollowDJ(djId: string) {
  trackEvent("dj_unfollowed", { djId });
}

export async function markDJSeen(djId: string, eventId?: string) {
  trackEvent("dj_seen", { djId, eventId: eventId ?? "" });
}

export async function unmarkDJSeen(djId: string, eventId?: string) {
  trackEvent("dj_unseen", { djId, eventId: eventId ?? "" });
}
