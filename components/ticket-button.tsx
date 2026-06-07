import { ExternalLink } from "lucide-react";
import type { Event } from "@/types";
import { getEventTicketProvider, getEventTicketUrl } from "@/lib/event-utils";

export function TicketButton({ event, compact = false }: { event: Event; compact?: boolean }) {
  const url = getEventTicketUrl(event);

  if (!url) {
    return (
      <button disabled type="button" className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm font-bold text-muted opacity-70">
        Entrada no disponible
      </button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-black text-void transition hover:bg-cyan"
    >
      {compact ? "Entrada" : "Comprar entrada"} <ExternalLink size={15} />
      <span className="sr-only">en {getEventTicketProvider(event)}</span>
    </a>
  );
}
