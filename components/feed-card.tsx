import Link from "next/link";
import { BadgeCheck, CalendarDays, Disc3, MapPin, Radio } from "lucide-react";
import type { Badge, DJ, Event, Producer, User, Venue } from "@/types";
import { CompactEventCard } from "@/components/compact-event-card";
import { DJCard } from "@/components/dj-card";
import { SocialLinks } from "@/components/social-links";
import { UserAvatar } from "@/components/user-avatar";

type FeedItem =
  | { type: "event"; event: Event; timestamp: string }
  | { type: "dj"; dj: DJ; timestamp: string }
  | { type: "producer"; producer: Producer; event: Event; timestamp: string }
  | { type: "venue"; venue: Venue; event: Event; timestamp: string }
  | { type: "user-going"; user: User; event: Event; timestamp: string }
  | { type: "user-seen"; user: User; dj: DJ; timestamp: string }
  | { type: "badge"; user: User; badge: Badge; timestamp: string };

export function FeedCard({ item }: { item: FeedItem }) {
  if (item.type === "event") {
    return (
      <article className="glass rounded-lg p-4">
        <FeedHeader icon={<CalendarDays size={18} />} origin="Evento" title="Nueva entrada disponible" timestamp={item.timestamp} />
        <div className="mt-3"><CompactEventCard event={item.event} /></div>
      </article>
    );
  }

  if (item.type === "dj") {
    return (
      <article className="glass rounded-lg p-4">
        <FeedHeader icon={<Disc3 size={18} />} origin="DJ" title="DJ confirmó próximo evento" timestamp={item.timestamp} />
        <div className="mt-3"><DJCard dj={item.dj} compact /></div>
      </article>
    );
  }

  if (item.type === "producer") {
    return (
      <article className="glass rounded-lg p-4">
        <FeedHeader icon={<Radio size={18} />} origin="Productora" title={`${item.producer.name} publicó lineup`} timestamp={item.timestamp} />
        <p className="mt-3 text-sm text-zinc-300">{item.event.name} ya está en el radar.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href={`/app/events/${item.event.slug}`} className="inline-flex text-sm font-black text-cyan">Ver evento</Link>
          <Link href={`/app/producers/${item.producer.slug}`} className="inline-flex text-sm font-black text-cyan">Ver productora</Link>
        </div>
        <div className="mt-3">
          <SocialLinks links={{ instagram_url: item.producer.instagram_url ?? item.producer.instagramUrl, website_url: item.producer.website_url ?? item.producer.websiteUrl }} compact />
        </div>
      </article>
    );
  }

  if (item.type === "venue") {
    return (
      <article className="glass rounded-lg p-4">
        <FeedHeader icon={<MapPin size={18} />} origin="Venue/local" title={`${item.venue.name} anunció fecha`} timestamp={item.timestamp} />
        <p className="mt-3 text-sm text-zinc-300">{item.event.name} · {item.venue.city}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href={`/app/events/${item.event.slug}`} className="inline-flex text-sm font-black text-cyan">Ver evento</Link>
          <Link href={`/app/venues/${item.venue.slug}`} className="inline-flex text-sm font-black text-cyan">Ver local</Link>
        </div>
      </article>
    );
  }

  if (item.type === "user-going") {
    return (
      <article className="glass rounded-lg p-4">
        <FeedHeader avatar={item.user.alias} origin="Usuario" title={`${item.user.alias} marcó Voy`} timestamp={item.timestamp} />
        <p className="mt-3 text-sm text-zinc-300">{item.event.name}</p>
      </article>
    );
  }

  if (item.type === "user-seen") {
    return (
      <article className="glass rounded-lg p-4">
        <FeedHeader avatar={item.user.alias} origin="Usuario" title={`${item.user.alias} vio a ${item.dj.name}`} timestamp={item.timestamp} />
        <Link href={`/app/djs/${item.dj.slug}`} className="mt-3 inline-flex text-sm font-black text-cyan">Ver DJ</Link>
      </article>
    );
  }

  return (
    <article className="glass rounded-lg p-4">
      <FeedHeader avatar={item.user.alias} origin="Usuario" title={`${item.user.alias} desbloqueó badge`} timestamp={item.timestamp} />
      <div className="mt-3 rounded-md bg-white/[0.04] p-3">
        <p className="flex items-center gap-2 font-black text-white"><BadgeCheck size={18} /> {item.badge.name}</p>
        <p className="mt-1 text-sm text-muted">{item.badge.description}</p>
      </div>
    </article>
  );
}

function FeedHeader({ title, timestamp, origin, icon, avatar }: { title: string; timestamp: string; origin: string; icon?: React.ReactNode; avatar?: string }) {
  return (
    <div className="flex items-center gap-3">
      {avatar ? <UserAvatar name={avatar} size="sm" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-void">{icon}</span>}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan">{origin}</p>
        <p className="font-black text-white">{title}</p>
        <p className="text-xs text-muted">{timestamp}</p>
      </div>
    </div>
  );
}
