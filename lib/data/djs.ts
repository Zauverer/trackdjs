import { djs } from "@/lib/data";

export function getDJs() {
  return djs;
}

export function getDJBySlug(slug: string) {
  return djs.find((dj) => dj.slug === slug);
}

export const getDJ = getDJBySlug;

export function getDJsByGenre(genre: string) {
  return djs.filter((dj) => dj.genres.includes(genre));
}
