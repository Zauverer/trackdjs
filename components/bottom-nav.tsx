"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Radio, Search, UserRound, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Radar", icon: Radio },
  { href: "/app/upcoming", label: "Fechas", icon: CalendarDays },
  { href: "/app/search", label: "Buscar", icon: Search },
  { href: "/app/feed", label: "Feed", icon: UsersRound },
  { href: "/app/profile", label: "Perfil", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/85 px-2 pb-3 pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold text-muted focus:outline-none focus:ring-2 focus:ring-cyan/70", active && "bg-white/10 text-white")}>
              <Icon size={19} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
