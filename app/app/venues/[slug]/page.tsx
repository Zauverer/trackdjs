import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, Navigation } from "lucide-react";
import { CompactEventCard } from "@/components/compact-event-card";
import { ContactPanel } from "@/components/contact-panel";
import { SocialLinks } from "@/components/social-links";
import { getEvents, getProducers, getVenueBySlug } from "@/lib/data";

export const metadata: Metadata = { title: "Venue" };

export default async function VenueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);
  if (!venue) notFound();
  const events = getEvents().filter((event) => event.venue === venue.name || event.venue_id === venue.slug);
  const upcoming = events.filter((event) => event.date >= "2026-06-06");
  const past = events.filter((event) => event.date < "2026-06-06");
  const producers = getProducers();
  const genres = [...new Set(events.flatMap((event) => event.genres))];
  const associatedProducers = [...new Set(events.map((event) => event.producer_id).filter(Boolean))]
    .map((producerSlug) => producers.find((producer) => producer.slug === producerSlug)?.name)
    .filter(Boolean);
  const lat = venue.latitude ?? venue.lat;
  const lng = venue.longitude ?? venue.lng;
  const mapUrl = venue.map_url ?? (lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : undefined);

  return (
    <div className="space-y-6">
      <section className="glass rounded-lg p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Venue</p>
        <h1 className="mt-2 text-4xl font-black text-white">{venue.name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-muted"><MapPin size={16} /> {venue.address ?? venue.city} {venue.comuna ? `· ${venue.comuna}` : ""}</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">{venue.description ?? "Local preparado para programación electrónica, visibilidad de fechas y mapa de escena."}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-300">
          {genres.map((genre) => <span key={genre} className="rounded-full border border-white/10 px-3 py-1">{genre}</span>)}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {mapUrl ? <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-black text-void"><Navigation size={16} /> Cómo llegar</a> : null}
          {venue.capacity ? <span className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-white"><Building2 size={16} /> Cap. {venue.capacity.toLocaleString("es-CL")}</span> : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">Próximos eventos</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {upcoming.length ? upcoming.map((event) => <CompactEventCard key={event.slug} event={event} />) : <p className="glass rounded-lg p-4 text-sm text-muted">Aún no hay próximas fechas cargadas.</p>}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Eventos pasados</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {past.length ? past.map((event) => <CompactEventCard key={event.slug} event={event} />) : <p className="glass rounded-lg p-4 text-sm text-muted">Todavía no hay historial pasado cargado.</p>}
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="glass overflow-hidden rounded-lg">
            <div className="relative h-44 bg-[radial-gradient(circle_at_30%_30%,rgba(0,229,255,0.18),transparent_32%),linear-gradient(135deg,#0a0a0a,#111827)]">
              <div className="absolute inset-6 rounded-lg border border-white/10" />
              <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-pulse text-white shadow-[0_0_35px_rgba(255,46,136,0.55)]">
                <MapPin size={22} />
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-black text-white">{venue.comuna ?? venue.city}</p>
              <p className="mt-1 text-xs text-muted">{lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : "Coordenadas pendientes"}</p>
            </div>
          </div>
          <ContactPanel
            entityType="venue"
            email={venue.contact_email}
            phone={venue.contact_phone}
            website={venue.website_url ?? venue.websiteUrl}
            instagram={venue.instagram_url ?? venue.instagramUrl}
            tiktok={venue.tiktok_url}
            mapUrl={mapUrl}
          />
          <div className="glass rounded-lg p-4">
            <h3 className="font-black text-white">Escena del local</h3>
            <p className="mt-2 text-sm text-muted">Estilos: {genres.join(" · ") || "Por mapear"}</p>
            <p className="mt-2 text-sm text-muted">Productoras: {associatedProducers.join(" · ") || "Por mapear"}</p>
          </div>
          <SocialLinks
            links={{
              instagram_url: venue.instagram_url ?? venue.instagramUrl,
              tiktok_url: venue.tiktok_url,
              website_url: venue.website_url ?? venue.websiteUrl,
              map_url: mapUrl,
            }}
            compact
          />
        </aside>
      </section>
      <Link href="/app/venues" className="inline-flex text-sm font-bold text-cyan">Volver a venues</Link>
    </div>
  );
}
