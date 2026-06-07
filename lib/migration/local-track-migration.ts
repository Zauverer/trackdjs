"use client";

import { initialTrackState } from "@/lib/use-track-state";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { TrackState } from "@/types";

const STORAGE_KEY = "trackdjs:v1";

export type LocalTrackMigrationResult =
  | { status: "skipped"; reason: string; state: TrackState }
  | { status: "ready"; reason: string; state: TrackState };

export function readLocalTrackSnapshot(): TrackState {
  if (typeof window === "undefined") return initialTrackState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialTrackState, ...JSON.parse(raw) } : initialTrackState;
  } catch {
    return initialTrackState;
  }
}

export async function prepareLocalTrackMigration(): Promise<LocalTrackMigrationResult> {
  const state = readLocalTrackSnapshot();

  if (!isSupabaseConfigured()) {
    return {
      status: "skipped",
      reason: "Supabase is not configured. Keep using localStorage fallback.",
      state
    };
  }

  return {
    status: "ready",
    reason: "Supabase is configured. Sprint 5B can write this snapshot after authenticated login.",
    state
  };
}

export async function migrateLocalTrackToSupabaseDryRun() {
  const snapshot = await prepareLocalTrackMigration();
  return {
    ...snapshot,
    plan: {
      followedDjs: snapshot.state.followedDjs.length,
      seenDjs: snapshot.state.seenDjs.length,
      savedEvents: snapshot.state.savedEvents.length,
      goingEvents: snapshot.state.goingEvents.length,
      attendedEvents: snapshot.state.attendedEvents.length
    }
  };
}
