import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Factory, Mail } from "lucide-react";
import { SocialLinks } from "@/components/social-links";
import { getEvents, getProducers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Productoras",
  description: "Productoras activas, lineups y reputación constructiva."
};

export default function ProducersPage() {
  const events = getEvents();
  const producers = getProducers();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Productoras activas</p>
        <h1 className="mt-2 text-3xl font-black text-white">Lineups y reputación</h1>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {producers.map((producer) => {
          const count = events.filter((event) => event.producer_id === producer.slug).length;
          return (
            <article key={producer.slug} className="glass rounded-lg p-4 hover:border-cyan/40">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-pulse"><Factory size={15} /> Productora</p>
              <Link href={`/app/producers/${producer.slug}`} className="mt-2 flex items-center gap-2 text-xl font-black text-white hover:text-cyan">{producer.name} {producer.verified ? <BadgeCheck size={16} className="text-success" /> : null}</Link>
              <p className="mt-2 text-sm text-muted">{producer.comuna ? `${producer.comuna}, ` : ""}{producer.city} · {producer.signature}</p>
              <p className="mt-3 text-sm text-zinc-300">{count} eventos mapeados</p>
              <p className="mt-2 flex items-center gap-2 text-xs font-bold text-muted"><Mail size={13} /> {producer.contact_email ? "Contacto disponible" : "Contacto pendiente"}</p>
              <div className="mt-3">
                <SocialLinks links={{ instagram_url: producer.instagram_url ?? producer.instagramUrl, tiktok_url: producer.tiktok_url, website_url: producer.website_url ?? producer.websiteUrl }} compact />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
