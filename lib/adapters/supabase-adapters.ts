import type { DJ, Event } from "@/types";

export type SupabaseDJRow = {
  slug: string;
  artist_name: string;
  city: string | null;
  country: string | null;
  genres: string[] | null;
  bio: string | null;
  instagram_url: string | null;
  tiktok_url?: string | null;
  soundcloud_url: string | null;
  spotify_url: string | null;
  youtube_url?: string | null;
  website_url?: string | null;
  contact_email?: string | null;
  contact_enabled?: boolean | null;
};

export type SupabaseEventRow = {
  slug: string;
  name: string;
  description: string | null;
  starts_at: string;
  city: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  event_type: string | null;
  genres: string[] | null;
  ticket_url?: string | null;
};

export function supabaseDJToDJ(row: SupabaseDJRow): DJ {
  return {
    slug: row.slug,
    name: row.artist_name,
    city: row.city ?? "",
    country: row.country ?? "",
    genres: row.genres ?? [],
    bio: row.bio ?? "",
    followers: 0,
    seenBy: 0,
    rating: 0,
    instagram_url: row.instagram_url ?? undefined,
    tiktok_url: row.tiktok_url ?? undefined,
    soundcloud_url: row.soundcloud_url ?? undefined,
    spotify_url: row.spotify_url ?? undefined,
    youtube_url: row.youtube_url ?? undefined,
    website_url: row.website_url ?? undefined,
    contact_email: row.contact_email ?? undefined,
    contact_enabled: row.contact_enabled ?? false,
    links: {
      instagram: row.instagram_url ?? "",
      soundcloud: row.soundcloud_url ?? "",
      spotify: row.spotify_url ?? "",
      youtube: row.youtube_url ?? undefined,
      website: row.website_url ?? undefined
    }
  };
}

export function supabaseEventToEvent(row: SupabaseEventRow): Event {
  return {
    slug: row.slug,
    name: row.name,
    date: row.starts_at.slice(0, 10),
    time: row.starts_at.slice(11, 16),
    city: row.city ?? "",
    venue: "",
    address: row.address ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    type: row.event_type === "Open Air" || row.event_type === "Festival" || row.event_type === "Warehouse" ? row.event_type : "Club",
    genres: row.genres ?? [],
    lineup: [],
    description: row.description ?? "",
    coverTone: "from-neon via-pulse to-cyan",
    sourceUrl: row.ticket_url ?? undefined,
    sourceName: row.ticket_url ? "Ticket" : undefined,
    dataQuality: "partial",
    attendees: [],
    timetable: []
  };
}
