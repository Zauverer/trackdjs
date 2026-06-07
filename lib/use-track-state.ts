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
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const STORAGE_KEY = "trackdjs:v1";
const REMINDER_KEY = "trackdjs:set-reminders:v1";
const MIGRATION_DISMISSED_AT_KEY = "trackdjs_migration_dismissed_at";
const MIGRATION_SAVED_AT_KEY = "trackdjs_migration_saved_at";
const MIGRATION_LAST_HASH_KEY = "trackdjs_migration_last_hash";
const MIGRATION_CHOICE_KEY = "trackdjs_migration_choice";
const MIGRATION_COOLDOWN_MS = 24 * 60 * 60 * 1000;

type Client = SupabaseClient<Database>;
type ActionKey = keyof TrackState;

type MigrationChoice = "saved" | "later" | "ignored";

type MigrationSummary = {
  followedDjs: number;
  seenDjs: number;
  wantToSeeDjs: number;
  savedEvents: number;
  eventPlans: number;
  reminders: number;
};

const emptyTrackState: TrackState = {
  followedDjs: [],
  seenDjs: [],
  wantToSeeDjs: [],
  savedEvents: [],
  goingEvents: [],
  interestedEvents: [],
  attendedEvents: []
};

export const initialTrackState: TrackState = {
  followedDjs: ["amelie-lens", "fjaak"],
  seenDjs: ["amelie-lens", "charlotte-de-witte", "hernan-cattaneo"],
  wantToSeeDjs: ["keinemusik", "adriatique"],
  savedEvents: ["neon-rave-santiago"],
  goingEvents: ["neon-rave-santiago"],
  interestedEvents: ["warehouse-ritual"],
  attendedEvents: ["after-hours-protocol"]
};

const remoteStateCache = new Map<string, TrackState>();
const remoteLoadPromiseCache = new Map<string, Promise<TrackState>>();
const promptedMigrationHashes = new Set<string>();

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
  const [pendingActions, setPendingActions] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const loadedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || !user || !supabase || loadedUserRef.current === user.id) return;
    loadedUserRef.current = user.id;

    const storedLocal = readStoredTrackState();
    const localHash = storedLocal ? hashTrackState(storedLocal) : null;
    const shouldPromptMigration = Boolean(storedLocal && localHash && hasActivity(storedLocal) && shouldShowMigrationPrompt(localHash));
    const promptKey = localHash ? `${user.id}:${localHash}` : null;

    setRemoteLoading(true);
    loadRemoteTrackState(supabase as never, user)
      .then((remoteState) => {
        setState(remoteState);
        if (storedLocal && localHash && promptKey && shouldPromptMigration && !promptedMigrationHashes.has(promptKey)) {
          promptedMigrationHashes.add(promptKey);
          dispatchMigrationPrompt({
            hash: localHash,
            summary: summarizeTrackState(storedLocal),
            onConfirm: async () => {
              await migrateLocalTrackToSupabase(supabase as never, user, storedLocal);
              markMigrationChoice("saved", localHash);
              remoteStateCache.delete(user.id);
              remoteLoadPromiseCache.delete(user.id);
              const nextRemoteState = await loadRemoteTrackState(supabase as never, user);
              setState(nextRemoteState);
            },
            onLater: () => markMigrationChoice("later", localHash),
            onDismiss: () => markMigrationChoice("ignored", localHash)
          });
        }
      })
      .catch((error) => {
        console.error("Track state remote load error", error);
        setActionError("No pudimos cargar tu actividad guardada. Reintenta en unos segundos.");
      })
      .finally(() => setRemoteLoading(false));
  }, [hydrated, setState, supabase, user]);

  const actions = useMemo(() => {
    const maybeShowAuthGate = () => {
      if (!user && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("trackdjs:auth-gate"));
      }
    };

    const updateKey = (latest: TrackState, key: ActionKey, slug: string, active: boolean): TrackState => {
      const items = latest[key] as string[];
      return {
        ...latest,
        [key]: active ? unique([...items, slug]) : items.filter((item) => item !== slug)
      };
    };

    const toggleWithSync = (key: ActionKey, slug: string, actionId: string, operation: (active: boolean) => Promise<void>) => {
      const latest = hydrated ? readValue() : state;
      const items = latest[key] as string[];
      const active = items.includes(slug);
      const nextActive = !active;
      const optimisticState = updateKey(latest, key, slug, nextActive);

      setActionError(null);
      setState(optimisticState);
      maybeShowAuthGate();

      if (!user || !supabase) return nextActive;

      setPendingActions((current) => unique([...current, actionId]));
      void operation(nextActive)
        .then(() => {
          remoteStateCache.set(user.id, optimisticState);
        })
        .catch((error) => {
          console.error("Track action sync error", { actionId, slug, error });
          setState(latest);
          setActionError("No pudimos guardar esta acción. Intenta nuevamente.");
        })
        .finally(() => {
          setPendingActions((current) => current.filter((item) => item !== actionId));
        });

      return nextActive;
    };

    return {
      toggleFollow: (slug: string) => {
        const actionId = actionKey("dj_follow", slug);
        const active = toggleWithSync("followedDjs", slug, actionId, (nextActive) => setRemoteDjFollow(supabase as never, user!, slug, nextActive));
        trackEvent(active ? "dj_followed" : "dj_unfollowed", { slug });
      },
      toggleSeen: (slug: string) => {
        const actionId = actionKey("dj_seen", slug);
        const active = toggleWithSync("seenDjs", slug, actionId, (nextActive) => setRemoteDjSeen(supabase as never, user!, slug, nextActive));
        trackEvent(active ? "dj_seen" : "dj_unseen", { slug });
      },
      toggleWantToSee: (slug: string) => {
        const actionId = actionKey("dj_want", slug);
        toggleWithSync("wantToSeeDjs", slug, actionId, (nextActive) => setRemoteDjWishlist(supabase as never, user!, slug, nextActive));
      },
      toggleSavedEvent: (slug: string) => {
        const actionId = actionKey("event_saved", slug);
        const active = toggleWithSync("savedEvents", slug, actionId, (nextActive) => setRemoteEventStatus(supabase as never, user!, slug, "interested", nextActive));
        trackEvent(active ? "event_saved" : "event_unsaved", { slug });
      },
      toggleGoingEvent: (slug: string) => {
        const actionId = actionKey("event_going", slug);
        const active = toggleWithSync("goingEvents", slug, actionId, (nextActive) => setRemoteEventStatus(supabase as never, user!, slug, "going", nextActive));
        trackEvent(active ? "event_going" : "event_status_changed", { slug, status: active ? "going" : "not_going" });
      },
      toggleInterestedEvent: (slug: string) => {
        const actionId = actionKey("event_interested", slug);
        toggleWithSync("interestedEvents", slug, actionId, (nextActive) => setRemoteEventStatus(supabase as never, user!, slug, "interested", nextActive));
      },
      toggleAttendedEvent: (slug: string) => {
        const actionId = actionKey("event_attended", slug);
        toggleWithSync("attendedEvents", slug, actionId, (nextActive) => setRemoteEventStatus(supabase as never, user!, slug, "attended", nextActive));
      }
    };
  }, [hydrated, readValue, setState, state, supabase, user]);

  const stats = useMemo(() => getUserTrackStats(state), [state]);
  const isActionPending = (id: string) => pendingActions.includes(id);

  return { state, actions, stats, hydrated, remoteLoading, isAuthenticated: Boolean(user), actionError, isActionPending };
}

export function useTrackedDJs() {
  const { state, actions, isActionPending, actionError } = useTrackState();
  return { followedDjs: state.followedDjs, seenDjs: state.seenDjs, wantToSeeDjs: state.wantToSeeDjs, actions, isActionPending, actionError };
}

export function useSavedEvents() {
  const { state, actions, isActionPending, actionError } = useTrackState();
  return { savedEvents: state.savedEvents, goingEvents: state.goingEvents, attendedEvents: state.attendedEvents, actions, isActionPending, actionError };
}

export function useUserEventStatus(slug: string) {
  const { state, actions, isActionPending, actionError } = useTrackState();
  return {
    saved: state.savedEvents.includes(slug),
    going: state.goingEvents.includes(slug),
    interested: state.interestedEvents.includes(slug),
    attended: state.attendedEvents.includes(slug),
    actions,
    actionError,
    isPending: {
      saved: isActionPending(actionKey("event_saved", slug)),
      going: isActionPending(actionKey("event_going", slug)),
      interested: isActionPending(actionKey("event_interested", slug)),
      attended: isActionPending(actionKey("event_attended", slug))
    }
  };
}

export function actionKey(type: string, slug: string) {
  return `${type}:${slug}`;
}

export function getTrackMigrationDebug() {
  if (typeof window === "undefined") {
    return { localStorageDetected: false, hash: null, choice: null, dismissedAt: null, savedAt: null };
  }
  const stored = readStoredTrackState();
  return {
    localStorageDetected: Boolean(stored && hasActivity(stored)),
    hash: stored ? hashTrackState(stored) : null,
    choice: window.localStorage.getItem(MIGRATION_CHOICE_KEY),
    dismissedAt: window.localStorage.getItem(MIGRATION_DISMISSED_AT_KEY),
    savedAt: window.localStorage.getItem(MIGRATION_SAVED_AT_KEY)
  };
}

async function loadRemoteTrackState(supabase: Client, user: User) {
  const cached = remoteStateCache.get(user.id);
  if (cached) return cached;

  const existingPromise = remoteLoadPromiseCache.get(user.id);
  if (existingPromise) return existingPromise;

  const promise = fetchRemoteTrackState(supabase, user).then((remoteState) => {
    remoteStateCache.set(user.id, remoteState);
    remoteLoadPromiseCache.delete(user.id);
    return remoteState;
  });
  remoteLoadPromiseCache.set(user.id, promise);
  return promise;
}

function readStoredTrackState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...emptyTrackState, ...JSON.parse(raw) } as TrackState;
  } catch {
    return null;
  }
}

function hasActivity(state: TrackState) {
  return Object.values(state).some((items) => items.length > 0);
}

function summarizeTrackState(state: TrackState): MigrationSummary {
  return {
    followedDjs: state.followedDjs.length,
    seenDjs: state.seenDjs.length,
    wantToSeeDjs: state.wantToSeeDjs.length,
    savedEvents: state.savedEvents.length,
    eventPlans: unique([...state.goingEvents, ...state.interestedEvents, ...state.attendedEvents]).length,
    reminders: readReminderCount()
  };
}

function readReminderCount() {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(REMINDER_KEY);
    const parsed = raw ? JSON.parse(raw) as { reminders?: unknown } : null;
    return Array.isArray(parsed?.reminders) ? parsed.reminders.length : 0;
  } catch {
    return 0;
  }
}

function shouldShowMigrationPrompt(hash: string) {
  if (typeof window === "undefined") return false;
  const lastHash = window.localStorage.getItem(MIGRATION_LAST_HASH_KEY);
  const choice = window.localStorage.getItem(MIGRATION_CHOICE_KEY) as MigrationChoice | null;
  const dismissedAt = Number(window.localStorage.getItem(MIGRATION_DISMISSED_AT_KEY) ?? 0);

  if (lastHash === hash && choice === "saved") return false;
  if (lastHash === hash && choice === "ignored") return false;
  if (lastHash === hash && choice === "later" && Date.now() - dismissedAt < MIGRATION_COOLDOWN_MS) return false;
  return true;
}

function markMigrationChoice(choice: MigrationChoice, hash: string) {
  if (typeof window === "undefined") return;
  const now = String(Date.now());
  window.localStorage.setItem(MIGRATION_LAST_HASH_KEY, hash);
  window.localStorage.setItem(MIGRATION_CHOICE_KEY, choice);
  if (choice === "saved") window.localStorage.setItem(MIGRATION_SAVED_AT_KEY, now);
  if (choice === "later" || choice === "ignored") window.localStorage.setItem(MIGRATION_DISMISSED_AT_KEY, now);
}

function dispatchMigrationPrompt(detail: {
  hash: string;
  summary: MigrationSummary;
  onConfirm: () => Promise<void>;
  onLater: () => void;
  onDismiss: () => void;
}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("trackdjs:migration-prompt", { detail }));
}

function hashTrackState(state: TrackState) {
  const payload = JSON.stringify({
    followedDjs: [...state.followedDjs].sort(),
    seenDjs: [...state.seenDjs].sort(),
    wantToSeeDjs: [...state.wantToSeeDjs].sort(),
    savedEvents: [...state.savedEvents].sort(),
    goingEvents: [...state.goingEvents].sort(),
    interestedEvents: [...state.interestedEvents].sort(),
    attendedEvents: [...state.attendedEvents].sort()
  });
  let hash = 0;
  for (let index = 0; index < payload.length; index += 1) {
    hash = (Math.imul(31, hash) + payload.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function unique(values: string[]) {
  return [...new Set(values)];
}
