import type { MetadataRoute } from "next";
import { getDJs, getEvents } from "@/lib/data";

const baseUrl = "https://trackdjs.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/app", "/app/explore", "/app/events", "/app/upcoming", "/app/djs", "/app/my-track", "/app/profile"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date("2026-06-06")
  }));

  const eventRoutes = getEvents().map((event) => ({
    url: `${baseUrl}/app/events/${event.slug}`,
    lastModified: new Date("2026-06-06")
  }));

  const djRoutes = getDJs().map((dj) => ({
    url: `${baseUrl}/app/djs/${dj.slug}`,
    lastModified: new Date("2026-06-06")
  }));

  return [...staticRoutes, ...eventRoutes, ...djRoutes];
}
