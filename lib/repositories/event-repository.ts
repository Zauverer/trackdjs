import { getEventBySlug as getMockEventBySlug, getEvents as getMockEvents, getUpcomingEvents as getMockUpcomingEvents } from "@/lib/data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { trackEvent } from "@/lib/analytics";
import { supabaseEventToEvent, type SupabaseEventRow } from "@/lib/adapters/supabase-adapters";
import type { EventStatus } from "@/types";

export async function getEvents() {
  if (!isSupabaseConfigured()) return getMockEvents();

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase!.from("events").select("*").order("starts_at");
  if (error || !data) return getMockEvents();

  return (data as SupabaseEventRow[]).map(supabaseEventToEvent);
}

export async function getEventBySlug(slug: string) {
  if (!isSupabaseConfigured()) return getMockEventBySlug(slug);
  return (await getEvents()).find((event) => event.slug === slug) ?? getMockEventBySlug(slug);
}

export async function getUpcomingEvents() {
  if (!isSupabaseConfigured()) return getMockUpcomingEvents();
  return (await getEvents()).filter((event) => event.date >= "2026-06-06");
}

export const listEvents = getEvents;
export const listUpcomingEvents = getUpcomingEvents;
export const getEventBySlugRepository = getEventBySlug;

export async function saveEvent(eventId: string) {
  trackEvent("event_saved", { eventId });
}

export async function unsaveEvent(eventId: string) {
  trackEvent("event_unsaved", { eventId });
}

export async function setEventStatus(eventId: string, status: EventStatus) {
  trackEvent("event_status_changed", { eventId, status });
}
