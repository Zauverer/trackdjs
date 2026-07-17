import type { ReactNode } from "react";

export function StatCard({ label, value, icon, onClick }: { label: string; value: string | number; icon?: ReactNode; onClick?: () => void }) {
  const className = `glass w-full rounded-lg p-4 text-left ${onClick ? "min-h-24 cursor-pointer transition hover:border-cyan/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan" : ""}`;
  const content = (
    <>
      <div className="mb-3 flex items-center justify-between text-muted">
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
    </>
  );

  return onClick ? <button type="button" onClick={onClick} className={className} aria-label={`Ver ${label}`}>{content}</button> : <div className={className}>{content}</div>;
}
