import type { DJ, Event } from "@/types";
import type { SeenDJActivity } from "@/lib/seen-dj-activity";

const countryToCode: Record<string, string> = {
  chile: "CL",
  cl: "CL",
  belgium: "BE",
  be: "BE",
  argentina: "AR",
  ar: "AR",
  russia: "RU",
  germany: "DE",
  de: "DE",
  netherlands: "NL",
  nl: "NL",
  switzerland: "CH",
  brazil: "BR",
  br: "BR",
  spain: "ES",
  france: "FR",
  fr: "FR",
  us: "US",
  usa: "US",
  "united states": "US",
  ukraine: "UA",
  "united kingdom": "GB",
  uk: "GB",
  gb: "GB",
  romania: "RO",
};

export function countryCodeToFlagEmoji(code?: string | null) {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  return String.fromCodePoint(...[...upper].map((char) => 127397 + char.charCodeAt(0)));
}

export function countryNameToFlagEmoji(country?: string | null) {
  if (!country) return "";
  return countryCodeToFlagEmoji(normalizeCountryCode(country));
}

export function normalizeCountryCode(country?: string | null) {
  if (!country) return "";
  const normalized = country.trim().toLowerCase();
  if (normalized.length === 2) return normalized.toUpperCase();
  return countryToCode[normalized] ?? "";
}

export function getCountryFlagLabel(country?: string | null, countryCode?: string | null) {
  const code = normalizeCountryCode(countryCode) || normalizeCountryCode(country) || "CL";
  return { code, flag: countryCodeToFlagEmoji(code) || "🇨🇱" };
}

export function getUniqueCountryFlagsFromSeenDjs(djs: Pick<DJ, "country">[]) {
  const flags = djs.map((dj) => countryNameToFlagEmoji(dj.country)).filter(Boolean);
  return unique(flags.length ? flags : ["🇨🇱"]);
}

export function getUniqueCountryFlagsFromEvents(events: Pick<Event, "city">[]) {
  if (!events.length) return [];
  return unique(events.map(() => "🇨🇱"));
}

export function getUniqueCountryFlagsFromSeenActivity(activity: Pick<SeenDJActivity, "countryCode" | "country">[]) {
  return unique(activity.map((item) => getCountryFlagLabel(item.country, item.countryCode).flag).filter(Boolean));
}

export function getUniqueCountryBadgesFromSeenActivity(activity: Pick<SeenDJActivity, "countryCode" | "country">[]) {
  return unique(activity.map((item) => {
    const { code, flag } = getCountryFlagLabel(item.country, item.countryCode);
    return `${flag} ${code}`;
  }));
}

function unique(values: string[]) {
  return [...new Set(values)];
}
