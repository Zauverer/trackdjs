"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ActionButton({
  active,
  onClick,
  children,
  icon,
  className
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5",
        "focus:outline-none focus:ring-2 focus:ring-cyan/70 focus:ring-offset-2 focus:ring-offset-void",
        active ? "border-success/50 bg-success/15 text-success shadow-cyan" : "border-white/10 bg-white/[0.04] text-zinc-100 hover:border-cyan/50",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}
