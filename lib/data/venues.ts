import { venues } from "@/lib/data";

export function getVenues() {
  return venues;
}

export function getVenueBySlug(slug: string) {
  return venues.find((venue) => venue.slug === slug);
}
