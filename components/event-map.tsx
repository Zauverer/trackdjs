"use client";

import Link from "next/link";
import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { ExternalLink, MapPin, Music2 } from "lucide-react";
import type { Event } from "@/types";
import { djs } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import { formatEventDate } from "@/lib/utils";
import { TicketButton } from "@/components/ticket-button";

function pinIcon(index: number) {
  return L.divIcon({
    className: "",
    html: `<div class="track-map-pin">${index}</div>`,
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
}

function eventDjs(event: Event) {
  return event.lineup
    .map((slug) => djs.find((dj) => dj.slug === slug))
    .filter(Boolean)
    .map((dj) => dj?.name)
    .join(" · ");
}

export function EventMap({ events, showList = true }: { events: Event[]; showList?: boolean }) {
  const mappedEvents = events.filter((event) => event.lat && event.lng);
  const center = useMemo<[number, number]>(() => {
    if (!mappedEvents.length) return [-33.4489, -70.6693];
    const lat = mappedEvents.reduce((sum, event) => sum + Number(event.lat), 0) / mappedEvents.length;
    const lng = mappedEvents.reduce((sum, event) => sum + Number(event.lng), 0) / mappedEvents.length;
    return [lat, lng];
  }, [mappedEvents]);

  return (
    <section className={showList ? "grid gap-4 lg:grid-cols-[1.1fr_0.9fr]" : "block"}>
      <div className="glass overflow-hidden rounded-lg">
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Mapa GPS</p>
            <h2 className="mt-2 text-2xl font-black text-white">Fiestas de hoy cerca de la pista</h2>
            <p className="mt-2 text-sm text-muted">Pincha un punto para ver evento, venue y DJs.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-muted">{mappedEvents.length} pins</span>
        </div>
        <div className="h-[420px] overflow-hidden border-y border-white/10 md:h-[520px]">
          <MapContainer center={center} zoom={mappedEvents.length > 1 ? 10 : 13} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mappedEvents.map((event, index) => (
              <Marker key={event.slug} position={[Number(event.lat), Number(event.lng)]} icon={pinIcon(index + 1)} eventHandlers={{ click: () => trackEvent("map_pin_clicked", { slug: event.slug }) }}>
                <Popup>
                  <div className="max-w-[240px] text-zinc-950">
                    <p className="text-base font-black">{event.name}</p>
                    <p className="mt-1 text-sm">{event.venue} · {event.city}</p>
                    <p className="mt-1 text-sm">{formatEventDate(event.date)} · {event.time}</p>
                    <p className="mt-2 text-sm"><b>DJs:</b> {eventDjs(event) || "Lineup por confirmar"}</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <a href={`/app/events/${event.slug}`} className="font-black text-violet-700">Ver evento</a>
                      <TicketButton event={event} compact />
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <p className="p-4 text-xs text-muted">
          Mapa real con OpenStreetMap para evitar API keys en el MVP. Queda listo para cambiar a Google Maps cuando tengamos cuenta/API key.
        </p>
      </div>

      {showList && <div className="space-y-3">
        {events.map((event, index) => {
          const names = eventDjs(event);
          return (
            <article key={event.slug} className="glass rounded-lg p-4">
              <div className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-sm font-black text-void">{index + 1}</span>
                <div className="min-w-0">
                  <Link href={`/app/events/${event.slug}`} className="font-black text-white hover:text-cyan">{event.name}</Link>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted"><MapPin size={15} /> {event.venue} · {event.city}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-zinc-300"><Music2 size={15} /> {names || "Lineup por confirmar"}</p>
                  <p className="mt-1 text-sm text-zinc-300">{formatEventDate(event.date)} · {event.time}</p>
                  {event.sourceUrl && (
                    <Link href={event.sourceUrl} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-cyan">
                      Fuente: {event.sourceName ?? "oficial"} <ExternalLink size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>}
    </section>
  );
}
