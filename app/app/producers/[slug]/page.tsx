import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin } from "lucide-react";
import { CompactEventCard } from "@/components/compact-event-card";
import { ContactPanel } from "@/components/contact-panel";
import { ProducerFeedbackSummary } from "@/components/producer-feedback";
import { SocialLinks } from "@/components/social-links";
import { getDJs, getEvents, getProducerBySlug } from "@/lib/data";

export const metadata: Metadata = { title: "Productora" };

export default async function ProducerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const producer = getProducerBySlug(slug);
  if (!producer) notFound();
  const events = getEvents().filter((event) => event.producer_id === producer.slug);
  const upcoming = events.filter((event) => event.date >= "2026-06-06");
  const past = events.filter((event) => event.date < "2026-06-06");
  const djs = getDJs();
  const genres = [...new Set(events.flatMap((event) => event.genres))];
  const venues = [...new Set(events.map((event) => event.venue))];
  const frequentDjs = [...new Set(events.flatMap((event) => event.lineup))]
    .map((djSlug) => djs.find((dj) => dj.slug === djSlug)?.name)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <section className="glass rounded-lg p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Productora</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-4xl font-black text-white">{producer.name}</h1>
          {producer.verified ? <span className="inline-flex items-center gap-1 rounded-full border border-success/30 px-2 py-1 text-xs font-black text-success"><BadgeCheck size={14} /> Verificada</span> : null}
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-muted"><MapPin size={16} /> {producer.comuna ? `${producer.comuna}, ` : ""}{producer.city} · {producer.signature}</p>
        <p className="mt-4 max-w-2xl text-zinc-300">{producer.bio ?? "Perfil editorial preparado para próximos eventos, venues frecuentes y feedback constructivo."}</p>
        <div className="mt-5">
          <SocialLinks
            links={{
              instagram_url: producer.instagram_url ?? producer.instagramUrl,
              tiktok_url: producer.tiktok_url,
              website_url: producer.website_url ?? producer.websiteUrl,
            }}
            compact
          />
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-2xl font-black text-white">Próximos eventos</h2>
          <div className="mt-4 grid gap-3">
            {upcoming.length ? upcoming.map((event) => <CompactEventCard key={event.slug} event={event} />) : <p className="glass rounded-lg p-4 text-sm text-muted">Aún no hay próximos eventos vinculados.</p>}
          </div>
          <h2 className="mt-8 text-2xl font-black text-white">Eventos pasados</h2>
          <div className="mt-4 grid gap-3">
            {past.length ? past.map((event) => <CompactEventCard key={event.slug} event={event} />) : <p className="glass rounded-lg p-4 text-sm text-muted">Todavía no hay historial pasado cargado.</p>}
          </div>
        </div>
        <aside className="space-y-4">
          <ContactPanel
            entityType="producer"
            email={producer.contact_email}
            phone={producer.contact_phone}
            website={producer.website_url ?? producer.websiteUrl}
            instagram={producer.instagram_url ?? producer.instagramUrl}
            tiktok={producer.tiktok_url}
          />
          <ProducerFeedbackSummary />
          <div className="glass rounded-lg p-4">
            <h3 className="font-black text-white">Frecuencias</h3>
            <p className="mt-2 text-sm text-muted">Estilos: {genres.join(" · ") || "Por mapear"}</p>
            <p className="mt-2 text-sm text-muted">Venues: {venues.join(" · ") || "Por mapear"}</p>
            <p className="mt-2 text-sm text-muted">DJs: {frequentDjs.join(" · ") || "Por mapear"}</p>
          </div>
        </aside>
      </section>
      <Link href="/app/producers" className="inline-flex text-sm font-bold text-cyan">Volver a productoras</Link>
    </div>
  );
}
