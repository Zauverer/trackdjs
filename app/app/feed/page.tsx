import type { Metadata } from "next";
import { FeedCard } from "@/components/feed-card";
import { getBadges, getDJs, getEvents, getProducers, getUsers, getVenues } from "@/lib/data";

export const metadata: Metadata = {
  title: "Feed",
  description: "Actividad pública de eventos, DJs, productoras, venues y usuarios."
};

export default function FeedPage() {
  const events = getEvents();
  const djs = getDJs();
  const producers = getProducers();
  const venues = getVenues();
  const users = getUsers();
  const badges = getBadges();

  const items = [
    { type: "event" as const, event: events[0], timestamp: "Ahora" },
    { type: "producer" as const, producer: producers[0], event: events[6], timestamp: "Hace 18 min" },
    { type: "user-going" as const, user: users[0], event: events[0], timestamp: "Hace 32 min" },
    { type: "dj" as const, dj: djs[0], timestamp: "Hoy" },
    { type: "venue" as const, venue: venues[5], event: events[1], timestamp: "Hoy" },
    { type: "user-seen" as const, user: users[3], dj: djs[1], timestamp: "Ayer" },
    { type: "badge" as const, user: users[5], badge: badges[1], timestamp: "Ayer" }
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <section>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Feed</p>
        <h1 className="mt-2 text-3xl font-black text-white">Actividad de escena</h1>
      </section>
      {items.map((item, index) => <FeedCard key={`${item.type}-${index}`} item={item} />)}
    </div>
  );
}
