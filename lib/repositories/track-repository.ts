import { getBadges, getDJs, getEvents } from "@/lib/data";
import { getUserTrackStats, initialTrackState } from "@/lib/use-track-state";
import type { TrackState } from "@/types";

export async function getMyTrackStats(state: TrackState = initialTrackState) {
  return getUserTrackStats(state);
}

export async function getSeenDJs(state: TrackState = initialTrackState) {
  return getDJs().filter((dj) => state.seenDjs.includes(dj.slug));
}

export async function getFollowedDJs(state: TrackState = initialTrackState) {
  return getDJs().filter((dj) => state.followedDjs.includes(dj.slug));
}

export async function getSavedEvents(state: TrackState = initialTrackState) {
  return getEvents().filter((event) => state.savedEvents.includes(event.slug));
}

export async function getGoingEvents(state: TrackState = initialTrackState) {
  return getEvents().filter((event) => state.goingEvents.includes(event.slug));
}

export async function getEarnedBadges(state: TrackState = initialTrackState) {
  const stats = getUserTrackStats(state);
  const unlocked = new Set(stats.unlockedBadges.map((badge) => badge.id));
  return getBadges().filter((badge) => unlocked.has(badge.id));
}
