import Link from "next/link";
import { Brand } from "@/components/brand";
import { BottomNav } from "@/components/bottom-nav";
import { AuthMenu } from "@/components/auth-menu";
import { TrackActionModals } from "@/components/track-action-modals";

const nav = [
  ["Radar", "/app"],
  ["Fechas", "/app/upcoming"],
  ["Buscar", "/app/search"],
  ["Feed", "/app/feed"],
  ["DJs", "/app/djs"],
  ["Venues", "/app/venues"],
  ["Productoras", "/app/producers"],
  ["Perfil", "/app/profile"]
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Brand href="/app" />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm font-semibold text-muted hover:bg-white/10 hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <AuthMenu />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 py-4 md:px-4 md:py-6">{children}</main>
      <BottomNav />
      <TrackActionModals />
    </div>
  );
}
