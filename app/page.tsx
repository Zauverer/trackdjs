import { redirect } from "next/navigation";

/** Creamfields 2026 is the entry experience; global TrackDJs remains at /app. */
export default function HomePage() {
  redirect("/creamfields-2026");
}
