import type { Metadata } from "next";
import { EventExplorer } from "@/components/event-explorer";
import { getEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Mapa GPS, filtros y timeline de fiestas electrónicas en TrackDJs."
};

export default function EventsPage() {
  const events = getEvents();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-pulse">Eventos</p>
        <h1 className="mt-2 text-4xl font-black text-white">Tu calendario de pista</h1>
        <p className="mt-2 text-muted">Mapa de fiestas de hoy, agenda futura y timeline preparado para sumar o restar noches.</p>
      </section>
      <EventExplorer events={events} />
    </div>
  );
}
