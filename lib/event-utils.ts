import { djs, producers, venues } from "@/lib/data";
import type { Event } from "@/types";

export function getEventTicketUrl(event: Event) {
  return event.ticket_url ?? event.sourceUrl ?? "";
}

export function getEventTicketProvider(event: Event) {
  return event.ticket_provider ?? event.sourceName ?? "Ticket";
}

export function getEventLineupNames(event: Event, limit = 3) {
  return event.lineup
    .map((slug) => djs.find((dj) => dj.slug === slug)?.name)
    .filter(Boolean)
    .slice(0, limit)
    .join(" · ");
}

export function getEventVenue(event: Event) {
  return venues.find((venue) => venue.slug === event.venue_id || venue.name === event.venue);
}

export function getEventProducer(event: Event) {
  return producers.find((producer) => producer.slug === event.producer_id);
}

export function eventComuna(event: Event) {
  return event.comuna ?? event.city;
}
