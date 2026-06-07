import { notFound } from "next/navigation";
import { events, getEvent } from "@/lib/data";
import { EventDetailClient } from "./event-detail-client";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEvent(slug);

  if (!event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}
