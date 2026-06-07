"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActionButton({
  active,
  onClick,
  children,
  icon,
  className,
  loading
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5",
        "focus:outline-none focus:ring-2 focus:ring-cyan/70 focus:ring-offset-2 focus:ring-offset-void",
        active ? "border-success/50 bg-success/15 text-success shadow-cyan" : "border-white/10 bg-white/[0.04] text-zinc-100 hover:border-cyan/50",
        loading && "cursor-wait opacity-70 hover:translate-y-0",
        className
      )}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : icon}
      {children}
    </button>
  );
}
