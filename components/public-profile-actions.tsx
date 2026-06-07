"use client";

import Link from "next/link";
import { Edit3, Radar, Share2, UserRound } from "lucide-react";
import { useSession } from "@/components/auth-provider";

export function PublicProfileActions({ username }: { username: string }) {
  const { user, profile, loading } = useSession();
  const isOwnProfile = Boolean(user && profile?.username && profile.username.toLowerCase() === username.toLowerCase());

  if (loading) {
    return <div className="h-11 w-36 rounded-md border border-white/10 bg-white/[0.04]" />;
  }

  if (isOwnProfile) {
    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <Link href="/app/profile?tab=editar" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black text-void">
          <Edit3 size={16} /> Editar mi perfil
        </Link>
        <Link href="/app/profile" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-bold text-white">
          <UserRound size={16} /> Volver a mi perfil
        </Link>
        <Link href="/app/my-track" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan/30 px-4 text-sm font-bold text-cyan">
          <Radar size={16} /> Ver Mi Track
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto">
      <Link href="/app" className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-black text-void">
        Volver al radar
      </Link>
      <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan/30 px-4 text-sm font-bold text-cyan">
        <Share2 size={16} /> Compartir perfil
      </button>
    </div>
  );
}
