import type { DJ, Event, EventStatus, TrackState, UserTrackStats } from "@/types";
import type { ProfileInput } from "@/lib/repositories/profile-repository";

export type RepositoryResult<T> = Promise<T>;

export type DJRepository = {
  getDJs(): RepositoryResult<DJ[]>;
  getDJBySlug(slug: string): RepositoryResult<DJ | undefined>;
  followDJ(djId: string): RepositoryResult<void>;
  unfollowDJ(djId: string): RepositoryResult<void>;
  markDJSeen(djId: string, eventId?: string): RepositoryResult<void>;
  unmarkDJSeen(djId: string, eventId?: string): RepositoryResult<void>;
};

export type EventRepository = {
  getEvents(): RepositoryResult<Event[]>;
  getEventBySlug(slug: string): RepositoryResult<Event | undefined>;
  getUpcomingEvents(): RepositoryResult<Event[]>;
  saveEvent(eventId: string): RepositoryResult<void>;
  unsaveEvent(eventId: string): RepositoryResult<void>;
  setEventStatus(eventId: string, status: EventStatus): RepositoryResult<void>;
};

export type ProfileRepository = {
  getCurrentProfile(): RepositoryResult<unknown>;
  updateProfile(input: ProfileInput): RepositoryResult<unknown>;
};

export type TrackRepository = {
  getMyTrackStats(state?: TrackState): RepositoryResult<UserTrackStats>;
  getSeenDJs(state?: TrackState): RepositoryResult<DJ[]>;
  getFollowedDJs(state?: TrackState): RepositoryResult<DJ[]>;
  getSavedEvents(state?: TrackState): RepositoryResult<Event[]>;
  getGoingEvents(state?: TrackState): RepositoryResult<Event[]>;
  getEarnedBadges(state?: TrackState): RepositoryResult<UserTrackStats["unlockedBadges"]>;
};
