import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { SeenDJActivity } from "@/lib/seen-dj-activity";

export function SeenDJMedalRack({
  activity,
  compact = false
}: {
  activity: SeenDJActivity[];
  compact?: boolean;
}) {
  if (!activity.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">
        Aún no tienes DJs vistos públicos.
      </div>
    );
  }

  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
      {activity.map((item) => (
        <Link
          key={`${item.slug}-${item.eventSlug ?? "self"}`}
          href={`/app/djs/${item.slug}`}
          className="group relative overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(176,38,255,0.18),transparent_35%),rgba(255,255,255,0.04)] p-4 transition hover:-translate-y-0.5 hover:border-cyan/40"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">{item.flag} {item.countryCode} · {item.year}</p>
              <h3 className="mt-2 text-lg font-black leading-tight text-white">{item.name}</h3>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-xl shadow-glow">
              {item.flag}
            </span>
          </div>
          <p className="mt-3 line-clamp-1 text-sm text-zinc-300">{item.eventName ?? "Evento por completar"}</p>
          <p className="mt-3 inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-success">
            <ShieldCheck size={12} />
            {item.status === "verified" ? "verificado" : "autodeclarado"}
          </p>
        </Link>
      ))}
    </div>
  );
}
