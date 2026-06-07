import { cn } from "@/lib/utils";

export function GenrePill({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-zinc-200", className)}>
      {label}
    </span>
  );
}
