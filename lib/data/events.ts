import { events } from "@/lib/data";

const today = "2026-06-06";

export function getEvents() {
  return events;
}

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}

export const getEvent = getEventBySlug;

export function getUpcomingEvents() {
  return [...events]
    .filter((event) => event.date >= today)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

export function getFeaturedEvents() {
  return getUpcomingEvents().slice(0, 3);
}

export function getEventsByCity(city: string) {
  const normalized = city.toLowerCase();
  return events.filter((event) => event.city.toLowerCase() === normalized);
}

export function getEventsByGenre(genre: string) {
  return events.filter((event) => event.genres.includes(genre));
}

export function getTodayEvents() {
  return events.filter((event) => event.date === today);
}
