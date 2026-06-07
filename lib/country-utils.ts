import type { DJ, Event } from "@/types";

const countryToCode: Record<string, string> = {
  chile: "CL",
  belgium: "BE",
  argentina: "AR",
  russia: "RU",
  germany: "DE",
  switzerland: "CH",
  brazil: "BR",
  spain: "ES",
  ukraine: "UA",
  "united kingdom": "GB",
  romania: "RO",
};

export function countryCodeToFlagEmoji(code?: string | null) {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  return String.fromCodePoint(...[...upper].map((char) => 127397 + char.charCodeAt(0)));
}

export function countryNameToFlagEmoji(country?: string | null) {
  if (!country) return "";
  return countryCodeToFlagEmoji(countryToCode[country.toLowerCase()] ?? country);
}

export function getUniqueCountryFlagsFromSeenDjs(djs: Pick<DJ, "country">[]) {
  const flags = djs.map((dj) => countryNameToFlagEmoji(dj.country)).filter(Boolean);
  return unique(flags.length ? flags : ["🇨🇱"]);
}

export function getUniqueCountryFlagsFromEvents(events: Pick<Event, "city">[]) {
  if (!events.length) return [];
  return unique(events.map(() => "🇨🇱"));
}

function unique(values: string[]) {
  return [...new Set(values)];
}
