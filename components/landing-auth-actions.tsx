"use client";

import Link from "next/link";
import { useSession } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";

export function LandingAuthActions() {
  const { loading, user, profile } = useSession();

  if (loading) {
    return <span className="text-xs font-bold text-muted">Cargando...</span>;
  }

  if (user) {
    const name = profile?.full_name ?? profile?.username ?? user.email ?? "TrackDJs";
    return (
      <div className="flex items-center gap-2">
        <Link href="/app/my-track" className="hidden rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-cyan/50 sm:inline-flex">
          Mi Track
        </Link>
        <Link href="/app/profile" className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-black text-void transition hover:bg-cyan">
          <UserAvatar name={name} size="sm" />
          Mi perfil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className="rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-cyan/50">
        Entrar
      </Link>
      <Link href="/signup" className="rounded-md border border-white/10 bg-white px-4 py-2 text-sm font-black text-void transition hover:bg-cyan">
        Crear cuenta
      </Link>
    </div>
  );
}
