import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { TrackState } from "@/types";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export async function fetchRemoteTrackState(supabase: Client, user: User): Promise<TrackState> {
  const [djMap, eventMap] = await Promise.all([fetchSlugMap(supabase, "djs"), fetchSlugMap(supabase, "events")]);
  const djById = invertMap(djMap);
  const eventById = invertMap(eventMap);

  const [follows, seen, wishlist, statuses] = await Promise.all([
    safeSelect(supabase.from("user_dj_follows").select("dj_id").eq("user_id", user.id)),
    safeSelect(supabase.from("user_seen_djs").select("dj_id").eq("user_id", user.id)),
    safeSelect(supabase.from("user_dj_wishlist").select("dj_id").eq("user_id", user.id)),
    safeSelect(supabase.from("user_event_status").select("event_id,status").eq("user_id", user.id)),
  ]);

  const next: TrackState = {
    followedDjs: mapIdsToSlugs(follows, "dj_id", djById),
    seenDjs: mapIdsToSlugs(seen, "dj_id", djById),
    wantToSeeDjs: mapIdsToSlugs(wishlist, "dj_id", djById),
    savedEvents: [],
    goingEvents: [],
    interestedEvents: [],
    attendedEvents: [],
  };

  statuses.forEach((row) => {
    const slug = eventById.get(String(row.event_id));
    if (!slug) return;
    if (row.status === "going") next.goingEvents.push(slug);
    if (row.status === "attended") next.attendedEvents.push(slug);
    if (row.status === "interested" || row.status === "saved") {
      next.interestedEvents.push(slug);
      next.savedEvents.push(slug);
    }
  });

  return {
    followedDjs: next.followedDjs,
    seenDjs: next.seenDjs,
    wantToSeeDjs: next.wantToSeeDjs,
    savedEvents: unique([...next.savedEvents]),
    goingEvents: unique([...next.goingEvents]),
    interestedEvents: unique([...next.interestedEvents]),
    attendedEvents: unique([...next.attendedEvents]),
  };
}

export async function setRemoteDjFollow(supabase: Client, user: User, djSlug: string, active: boolean) {
  const djId = await resolveId(supabase, "djs", djSlug);
  if (!djId) throw new Error(`DJ slug not found in Supabase: ${djSlug}`);
  if (active) {
    await assertMutation(supabase.from("user_dj_follows").upsert({ user_id: user.id, dj_id: djId }, { onConflict: "user_id,dj_id" }));
  } else {
    await assertMutation(supabase.from("user_dj_follows").delete().eq("user_id", user.id).eq("dj_id", djId));
  }
}

export async function setRemoteDjSeen(supabase: Client, user: User, djSlug: string, active: boolean, eventSlug?: string) {
  const [djId, eventId] = await Promise.all([resolveId(supabase, "djs", djSlug), eventSlug ? resolveId(supabase, "events", eventSlug) : Promise.resolve(null)]);
  if (!djId) throw new Error(`DJ slug not found in Supabase: ${djSlug}`);
  if (active) {
    if (!eventId) {
      await assertMutation(supabase.from("user_seen_djs").delete().eq("user_id", user.id).eq("dj_id", djId).is("event_id", null));
    }
    await assertMutation(supabase.from("user_seen_djs").upsert({
      user_id: user.id,
      dj_id: djId,
      event_id: eventId,
      seen_at: new Date().toISOString(),
      verification_status: "self_reported",
    }, { onConflict: "user_id,dj_id,event_id" }));
  } else {
    let query = supabase.from("user_seen_djs").delete().eq("user_id", user.id).eq("dj_id", djId);
    query = eventId ? query.eq("event_id", eventId) : query.is("event_id", null);
    await assertMutation(query);
  }
}

export async function setRemoteDjWishlist(supabase: Client, user: User, djSlug: string, active: boolean) {
  const djId = await resolveId(supabase, "djs", djSlug);
  if (!djId) throw new Error(`DJ slug not found in Supabase: ${djSlug}`);
  if (active) {
    await assertMutation(supabase.from("user_dj_wishlist").upsert({ user_id: user.id, dj_id: djId }, { onConflict: "user_id,dj_id" }));
  } else {
    await assertMutation(supabase.from("user_dj_wishlist").delete().eq("user_id", user.id).eq("dj_id", djId));
  }
}

export async function setRemoteEventStatus(supabase: Client, user: User, eventSlug: string, status: "interested" | "going" | "attended", active: boolean) {
  const eventId = await resolveId(supabase, "events", eventSlug);
  if (!eventId) throw new Error(`Event slug not found in Supabase: ${eventSlug}`);
  if (active) {
    await assertMutation(supabase.from("user_event_status").upsert({ user_id: user.id, event_id: eventId, status, updated_at: new Date().toISOString() }, { onConflict: "user_id,event_id" }));
  } else {
    await assertMutation(supabase.from("user_event_status").delete().eq("user_id", user.id).eq("event_id", eventId).eq("status", status));
  }
}

export async function setRemoteSetReminder(supabase: Client, user: User, reminderKey: string, active: boolean) {
  if (active) {
    await assertMutation(supabase.from("set_reminders").upsert({ user_id: user.id, reminder_key: reminderKey }, { onConflict: "user_id,reminder_key" }));
  } else {
    await assertMutation(supabase.from("set_reminders").delete().eq("user_id", user.id).eq("reminder_key", reminderKey));
  }
}

export async function migrateLocalTrackToSupabase(supabase: Client, user: User, state: TrackState) {
  await Promise.all([
    ...state.followedDjs.map((slug) => setRemoteDjFollow(supabase, user, slug, true)),
    ...state.seenDjs.map((slug) => setRemoteDjSeen(supabase, user, slug, true)),
    ...state.wantToSeeDjs.map((slug) => setRemoteDjWishlist(supabase, user, slug, true)),
    ...state.savedEvents.map((slug) => setRemoteEventStatus(supabase, user, slug, "interested", true)),
    ...state.interestedEvents.map((slug) => setRemoteEventStatus(supabase, user, slug, "interested", true)),
    ...state.goingEvents.map((slug) => setRemoteEventStatus(supabase, user, slug, "going", true)),
    ...state.attendedEvents.map((slug) => setRemoteEventStatus(supabase, user, slug, "attended", true)),
  ]);
}

async function resolveId(supabase: Client, table: "djs" | "events", slug: string) {
  const { data } = await supabase.from(table).select("id").eq("slug", slug).maybeSingle();
  return data?.id ? String(data.id) : null;
}

async function fetchSlugMap(supabase: Client, table: "djs" | "events") {
  const rows = await safeSelect(supabase.from(table).select("id,slug"));
  return new Map(rows.map((row) => [String(row.slug), String(row.id)]));
}

async function safeSelect<T extends Record<string, unknown>>(promise: PromiseLike<{ data: T[] | null; error: unknown }>) {
  const { data, error } = await promise;
  if (error || !data) return [] as T[];
  return data;
}

function invertMap(map: Map<string, string>) {
  return new Map([...map.entries()].map(([slug, id]) => [id, slug]));
}

function mapIdsToSlugs(rows: Record<string, unknown>[], key: string, map: Map<string, string>) {
  return unique(rows.map((row) => map.get(String(row[key]))).filter((value): value is string => Boolean(value)));
}

function unique(values: string[]) {
  return [...new Set(values)];
}

async function assertMutation(promise: PromiseLike<{ error: unknown }>) {
  const { error } = await promise;
  if (error) throw error;
}
