"use client";

export function FilterChips({ filters, active, onChange }: { filters: string[]; active: string; onChange: (filter: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          aria-pressed={active === filter}
          onClick={() => onChange(filter)}
          className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black transition ${active === filter ? "border-cyan bg-cyan/15 text-cyan" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25"}`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
