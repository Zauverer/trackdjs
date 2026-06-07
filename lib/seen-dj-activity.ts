import { getDJs, getEvents } from "@/lib/data";
import { getCountryFlagLabel } from "@/lib/country-utils";
import type { TrackState } from "@/types";

export type SeenDJActivity = {
  slug: string;
  name: string;
  year: string;
  country: string;
  countryCode: string;
  flag: string;
  eventName?: string;
  eventSlug?: string;
  status: "self_reported" | "verified";
};

type PublicSeenRow = {
  dj_slug?: string | null;
  artist_name?: string | null;
  country?: string | null;
  country_code?: string | null;
  event_slug?: string | null;
  event_name?: string | null;
  seen_year?: number | string | null;
  verification_status?: string | null;
};

export function buildSeenDJActivityFromTrackState(state: TrackState): SeenDJActivity[] {
  const djs = getDJs();
  const events = getEvents();

  const activity = state.seenDjs
    .map((slug): SeenDJActivity | null => {
      const dj = djs.find((item) => item.slug === slug);
      if (!dj) return null;
      const relatedEvent = events.find((event) => state.attendedEvents.includes(event.slug) && event.lineup.includes(slug))
        ?? events.find((event) => event.lineup.includes(slug));
      const { code, flag } = getCountryFlagLabel(dj.country);

      return {
        slug: dj.slug,
        name: dj.name,
        year: relatedEvent?.date.slice(0, 4) ?? "2026",
        country: dj.country || "Chile",
        countryCode: code,
        flag,
        eventName: relatedEvent?.name,
        eventSlug: relatedEvent?.slug,
        status: "self_reported" as const
      };
    })
    .filter((item): item is SeenDJActivity => Boolean(item));
  return activity;
}

export function buildSeenDJActivityFromPublicRows(rows: unknown): SeenDJActivity[] {
  if (!Array.isArray(rows)) return [];

  const activity = rows
    .map((row): SeenDJActivity | null => {
      const record = row as PublicSeenRow;
      if (!record.dj_slug || !record.artist_name) return null;
      const { code, flag } = getCountryFlagLabel(record.country, record.country_code);
      return {
        slug: String(record.dj_slug),
        name: String(record.artist_name),
        year: String(record.seen_year ?? "2026"),
        country: record.country ?? "Chile",
        countryCode: code,
        flag,
        eventName: record.event_name ?? undefined,
        eventSlug: record.event_slug ?? undefined,
        status: record.verification_status === "verified" ? "verified" as const : "self_reported" as const
      };
    })
    .filter((item): item is SeenDJActivity => Boolean(item));
  return activity;
}
