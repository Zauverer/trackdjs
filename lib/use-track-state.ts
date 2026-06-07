"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TrackState, UserTrackStats } from "@/types";
import { getBadges, getDJs, getEvents } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import { useLocalStorage } from "@/lib/use-local-storage";
import { useSession } from "@/components/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchRemoteTrackState,
  migrateLocalTrackToSupabase,
  setRemoteDjFollow,
  setRemoteDjSeen,
  setRemoteDjWishlist,
  setRemoteEventStatus
} from "@/lib/repositories/user-actions-repository";

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
  const { user } = useSession();
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [migrationPrompt, setMigrationPrompt] = useState(false);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const loadedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || !user || !supabase || loadedUserRef.current === user.id) return;
    loadedUserRef.current = user.id;
    const localSnapshot = readValue();
    const hasLocalActivity = Object.values(localSnapshot).some((items) => items.length > 0);

    setRemoteLoading(true);
    fetchRemoteTrackState(supabase as never, user, localSnapshot)
      .then((remoteState) => {
        setState(remoteState);
        if (hasLocalActivity) setMigrationPrompt(true);
      })
      .catch((error) => {
        console.error("Track state remote load error", error);
      })
      .finally(() => setRemoteLoading(false));
  }, [hydrated, readValue, setState, supabase, user]);

  useEffect(() => {
    if (!migrationPrompt || !user || !supabase) return;
    window.dispatchEvent(new CustomEvent("trackdjs:migration-prompt", {
      detail: {
        onConfirm: async () => {
          await migrateLocalTrackToSupabase(supabase as never, user, readValue());
          const remoteState = await fetchRemoteTrackState(supabase as never, user, readValue());
          setState(remoteState);
          setMigrationPrompt(false);
        },
        onLater: () => setMigrationPrompt(false),
        onDismiss: () => setMigrationPrompt(false)
      }
    }));
  }, [migrationPrompt, readValue, setState, supabase, user]);

  const actions = useMemo(() => {
    const maybeShowAuthGate = () => {
      if (!user && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("trackdjs:auth-gate"));
      }
    };

    const toggle = (key: keyof TrackState, slug: string) => {
      const latest = hydrated ? state : readValue();
      const items = latest[key] as string[];
      const active = items.includes(slug);
      const nextActive = !active;
      setState({
        ...latest,
        [key]: active ? items.filter((item: string) => item !== slug) : [...items, slug]
      });
      maybeShowAuthGate();
      return nextActive;
    };

    const sync = (operation: () => Promise<void>) => {
      if (!user || !supabase) return;
      void operation().catch((error) => console.error("Track action sync error", error));
    };

    return {
      toggleFollow: (slug: string) => {
        const active = toggle("followedDjs", slug);
        trackEvent(active ? "dj_followed" : "dj_unfollowed", { slug });
        sync(() => setRemoteDjFollow(supabase as never, user!, slug, active));
      },
      toggleSeen: (slug: string) => {
        const active = toggle("seenDjs", slug);
        trackEvent(active ? "dj_seen" : "dj_unseen", { slug });
        sync(() => setRemoteDjSeen(supabase as never, user!, slug, active));
      },
      toggleWantToSee: (slug: string) => {
        const active = toggle("wantToSeeDjs", slug);
        sync(() => setRemoteDjWishlist(supabase as never, user!, slug, active));
      },
      toggleSavedEvent: (slug: string) => {
        const active = toggle("savedEvents", slug);
        trackEvent(active ? "event_saved" : "event_unsaved", { slug });
        sync(() => setRemoteEventStatus(supabase as never, user!, slug, "interested", active));
      },
      toggleGoingEvent: (slug: string) => {
        const active = toggle("goingEvents", slug);
        trackEvent("event_going", { slug });
        sync(() => setRemoteEventStatus(supabase as never, user!, slug, "going", active));
      },
      toggleInterestedEvent: (slug: string) => {
        const active = toggle("interestedEvents", slug);
        sync(() => setRemoteEventStatus(supabase as never, user!, slug, "interested", active));
      },
      toggleAttendedEvent: (slug: string) => {
        const active = toggle("attendedEvents", slug);
        sync(() => setRemoteEventStatus(supabase as never, user!, slug, "attended", active));
      }
    };
  }, [hydrated, readValue, setState, state, supabase, user]);

  const stats = useMemo(() => getUserTrackStats(state), [state]);

  return { state, actions, stats, hydrated, remoteLoading, isAuthenticated: Boolean(user) };
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
