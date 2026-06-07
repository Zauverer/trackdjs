import type { Badge } from "@/types";

export function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className="glass rounded-lg p-4">
      <div className={`mb-4 h-14 rounded-md bg-gradient-to-br ${badge.tone} opacity-95 shadow-glow`} />
      <h3 className="font-bold text-white">{badge.name}</h3>
      <p className="mt-1 text-sm leading-5 text-muted">{badge.description}</p>
    </div>
  );
}
