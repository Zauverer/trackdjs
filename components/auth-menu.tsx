"use client";

import Link from "next/link";
import { Disc3, LogOut, UserRound } from "lucide-react";
import { useSession } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";

export function AuthMenu() {
  const { loading, user, profile, logout } = useSession();

  if (loading) {
    return <span className="hidden text-xs font-bold text-muted sm:inline">Cargando...</span>;
  }

  if (!user) {
    return (
      <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-black text-void hover:bg-cyan">
        Entrar
      </Link>
    );
  }

  const label = profile?.username ? `@${profile.username}` : user.email ?? "Mi Track";
  const avatarName = profile?.full_name ?? profile?.display_name ?? profile?.username ?? user.email ?? "TrackDJs";

  return (
    <div className="flex items-center gap-2">
      <Link href="/app/profile" className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-sm font-bold text-white hover:border-cyan/40 sm:flex">
        <UserAvatar name={avatarName} size="sm" />
        <span className="max-w-32 truncate">{label}</span>
      </Link>
      <Link href="/app/my-track" aria-label="Mi Track" className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-muted hover:border-cyan/40 hover:text-white">
        <Disc3 size={17} />
      </Link>
      <Link href="/app/profile" aria-label="Perfil" className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-white sm:hidden">
        <UserRound size={18} />
      </Link>
      <button type="button" onClick={logout} className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-muted hover:border-pulse/50 hover:text-white" aria-label="Cerrar sesión">
        <LogOut size={17} />
      </button>
    </div>
  );
}
