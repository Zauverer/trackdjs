"use client";

import { track } from "@vercel/analytics";

export type AnalyticsEvent =
  | "landing_cta_clicked"
  | "app_opened"
  | "event_saved"
  | "event_unsaved"
  | "event_status_changed"
  | "event_going"
  | "dj_followed"
  | "dj_unfollowed"
  | "dj_seen"
  | "dj_unseen"
  | "my_track_shared"
  | "my_track_opened"
  | "beta_opened"
  | "admin_opened"
  | "map_pin_clicked"
  | "upcoming_event_clicked";

export function trackEvent(name: AnalyticsEvent, properties?: Record<string, string | number | boolean>) {
  try {
    track(name, properties);
  } catch {
    // Analytics should never block the product experience.
  }
}
