import { genres } from "@/lib/data";

export function getGenres() {
  return genres;
}

export function getGenreById(id: string) {
  return genres.find((genre) => genre.id === id);
}
