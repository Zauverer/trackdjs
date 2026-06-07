export type Genre = {
  id: string;
  name: string;
  color: string;
};

export type DJ = {
  id?: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  flag?: string;
  genres: string[];
  bio: string;
  followers: number;
  seenBy: number;
  rating: number;
  contactEnabled?: boolean;
  contact_enabled?: boolean;
  contact_email?: string;
  instagram_url?: string;
  tiktok_url?: string;
  spotify_url?: string;
  soundcloud_url?: string;
  youtube_url?: string;
  website_url?: string;
  links: {
    instagram: string;
    soundcloud: string;
    spotify: string;
    youtube?: string;
    website?: string;
  };
};

export type Venue = {
  id?: string;
  slug: string;
  name: string;
  city: string;
  comuna?: string;
  type: string;
  address?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  description?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  instagram_url?: string;
  tiktok_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  map_url?: string;
};

export type Producer = {
  id?: string;
  slug: string;
  name: string;
  city: string;
  bio?: string;
  signature: string;
  instagramUrl?: string;
  websiteUrl?: string;
  instagram_url?: string;
  tiktok_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  comuna?: string;
  verified?: boolean;
};

export type Event = {
  id?: string;
  slug: string;
  name: string;
  date: string;
  time: string;
  start_time?: string;
  end_time?: string;
  city: string;
  comuna?: string;
  venue: string;
  venue_id?: string;
  producer_id?: string;
  address?: string;
  lat?: number;
  lng?: number;
  type: "Club" | "Open Air" | "Festival" | "Warehouse" | "After" | "Sunset";
  genres: string[];
  lineup: string[];
  description: string;
  coverTone: string;
  sourceName?: string;
  sourceUrl?: string;
  ticket_url?: string;
  ticket_provider?: string;
  price_from?: number;
  currency?: string;
  dataQuality?: "verified" | "partial" | "placeholder";
  stages?: string[];
  status?: "upcoming" | "live" | "finished" | "cancelled";
  attendees: string[];
  timetable: TimetableSlot[];
};

export type User = {
  id: string;
  alias: string;
  username?: string;
  city: string;
  bio?: string;
  genres: string[];
  instagram_url?: string;
  tiktok_url?: string;
  spotify_url?: string;
  spotify_playlist_url?: string;
  website_url?: string;
  public_contact_enabled?: boolean;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  tone: string;
};

export type TrackState = {
  followedDjs: string[];
  seenDjs: string[];
  wantToSeeDjs: string[];
  savedEvents: string[];
  goingEvents: string[];
  interestedEvents: string[];
  attendedEvents: string[];
};

export type TimetableSlot = {
  time: string;
  endTime?: string;
  artist: string;
  stage: string;
};

export type EventStatus = "saved" | "going" | "interested" | "attended";

export type DJFollowState = {
  followed: boolean;
  seen: boolean;
  wantToSee: boolean;
};

export type UserTrackStats = {
  seenDjs: number;
  followedDjs: number;
  savedEvents: number;
  goingEvents: number;
  attendedEvents: number;
  upcomingEvents: number;
  dominantGenre: string;
  unlockedBadges: Badge[];
};
