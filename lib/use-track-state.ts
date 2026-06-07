"use client";

import { useMemo } from "react";
import type { TrackState, UserTrackStats } from "@/types";
import { getBadges, getDJs, getEvents } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import { useLocalStorage } from "@/lib/use-local-storage";

const STORAGE_KEY = "trackdjs:v1";

export const initialTrackState: TrackState = {
  followedDjs: ["amelie-lens", "fjaak"],
  seenDjs: ["amelie-lens", "charlotte-de-witte", "hernan-cattaneo"],
  wantToSeeDjs: ["keinemusik", "adriatique"],
  savedEvents: ["neon-rave-santiago"],
  goingEvents: ["neon-rave-santiago"],
  interestedEvents: ["warehouse-ritual"],
  attendedEvents: ["after-hours-protocol"]
};

function dominantGenreFromState(state: TrackState) {
  const counts = new Map<string, number>();
  const djs = getDJs();
  const events = getEvents();

  state.seenDjs.forEach((slug) => {
    djs.find((dj) => dj.slug === slug)?.genres.forEach((genre) => counts.set(genre, (counts.get(genre) ?? 0) + 2));
  });

  [...state.savedEvents, ...state.goingEvents, ...state.attendedEvents].forEach((slug) => {
    events.find((event) => event.slug === slug)?.genres.forEach((genre) => counts.set(genre, (counts.get(genre) ?? 0) + 1));
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Melodic Techno";
}

export function getUserTrackStats(state: TrackState): UserTrackStats {
  const upcomingEvents = getEvents().filter((event) => state.goingEvents.includes(event.slug) || state.savedEvents.includes(event.slug));
  const badges = getBadges();
  const unlockedBadges = badges.filter((badge) => {
    if (badge.id === "first-rave") return state.attendedEvents.length > 0 || state.seenDjs.length > 0;
    if (badge.id === "warehouse") return upcomingEvents.some((event) => event.type === "Warehouse");
    if (badge.id === "crate-digger") return state.followedDjs.length >= 3;
    if (badge.id === "festival-run") return upcomingEvents.some((event) => event.type === "Festival");
    return state.seenDjs.length >= 3;
  });

  return {
    seenDjs: state.seenDjs.length,
    followedDjs: state.followedDjs.length,
    savedEvents: state.savedEvents.length,
    goingEvents: state.goingEvents.length,
    attendedEvents: state.attendedEvents.length,
    upcomingEvents: upcomingEvents.length,
    dominantGenre: dominantGenreFromState(state),
    unlockedBadges
  };
}

export function useTrackState() {
  const { value: state, setValue: setState, hydrated, readValue } = useLocalStorage<TrackState>(STORAGE_KEY, initialTrackState);

  const actions = useMemo(() => {
    const toggle = (key: keyof TrackState, slug: string) => {
      const latest = hydrated ? state : readValue();
      const items = latest[key] as string[];
      const active = items.includes(slug);
      setState({
        ...latest,
        [key]: active ? items.filter((item: string) => item !== slug) : [...items, slug]
      });
    };

    return {
      toggleFollow: (slug: string) => {
        trackEvent("dj_followed", { slug });
        toggle("followedDjs", slug);
      },
      toggleSeen: (slug: string) => {
        trackEvent("dj_seen", { slug });
        toggle("seenDjs", slug);
      },
      toggleWantToSee: (slug: string) => toggle("wantToSeeDjs", slug),
      toggleSavedEvent: (slug: string) => {
        trackEvent("event_saved", { slug });
        toggle("savedEvents", slug);
      },
      toggleGoingEvent: (slug: string) => {
        trackEvent("event_going", { slug });
        toggle("goingEvents", slug);
      },
      toggleInterestedEvent: (slug: string) => toggle("interestedEvents", slug),
      toggleAttendedEvent: (slug: string) => toggle("attendedEvents", slug)
    };
  }, [hydrated, readValue, setState, state]);

  const stats = useMemo(() => getUserTrackStats(state), [state]);

  return { state, actions, stats, hydrated };
}

export function useTrackedDJs() {
  const { state, actions } = useTrackState();
  return { followedDjs: state.followedDjs, seenDjs: state.seenDjs, wantToSeeDjs: state.wantToSeeDjs, actions };
}

export function useSavedEvents() {
  const { state, actions } = useTrackState();
  return { savedEvents: state.savedEvents, goingEvents: state.goingEvents, attendedEvents: state.attendedEvents, actions };
}

export function useUserEventStatus(slug: string) {
  const { state, actions } = useTrackState();
  return {
    saved: state.savedEvents.includes(slug),
    going: state.goingEvents.includes(slug),
    interested: state.interestedEvents.includes(slug),
    attended: state.attendedEvents.includes(slug),
    actions
  };
}
