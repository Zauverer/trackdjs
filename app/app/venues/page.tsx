import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { SocialLinks } from "@/components/social-links";
import { getEvents, getVenues } from "@/lib/data";

export const metadata: Metadata = {
  title: "Venues",
  description: "Locales y espacios con fechas electrónicas."
};

export default function VenuesPage() {
  const events = getEvents();
  const venues = getVenues();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Locales</p>
        <h1 className="mt-2 text-3xl font-black text-white">Venues con fechas</h1>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {venues.map((venue) => {
          const count = events.filter((event) => event.venue === venue.name || event.venue_id === venue.slug).length;
          return (
            <article key={venue.slug} className="glass rounded-lg p-4 hover:border-cyan/40">
              <Link href={`/app/venues/${venue.slug}`} className="text-xl font-black text-white hover:text-cyan">{venue.name}</Link>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted"><MapPin size={15} /> {venue.comuna ?? venue.city}</p>
              <p className="mt-3 text-sm text-zinc-300">{count} fechas en radar · {venue.type}</p>
              <p className="mt-2 flex items-center gap-2 text-xs font-bold text-muted"><Building2 size={13} /> {venue.capacity ? `Cap. ${venue.capacity.toLocaleString("es-CL")}` : "Capacidad pendiente"} · {venue.contact_email ? "contacto disponible" : "contacto pendiente"}</p>
              <div className="mt-3">
                <SocialLinks links={{ instagram_url: venue.instagram_url ?? venue.instagramUrl, tiktok_url: venue.tiktok_url, website_url: venue.website_url ?? venue.websiteUrl }} compact />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
