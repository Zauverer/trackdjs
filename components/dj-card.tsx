"use client";

import Link from "next/link";
import { Check, Eye, Plus } from "lucide-react";
import type { DJ } from "@/types";
import { GenrePill } from "@/components/genre-pill";
import { UserAvatar } from "@/components/user-avatar";
import { ActionButton } from "@/components/action-button";
import { useTrackState } from "@/lib/use-track-state";

export function DJCard({ dj, compact = false }: { dj: DJ; compact?: boolean }) {
  const { state, actions } = useTrackState();
  const followed = state.followedDjs.includes(dj.slug);
  const seen = state.seenDjs.includes(dj.slug);

  return (
    <article className="glass rounded-lg p-4">
      <div className="flex gap-4">
        <UserAvatar name={dj.name} size={compact ? "md" : "lg"} />
        <div className="min-w-0 flex-1">
          <Link href={`/app/djs/${dj.slug}`} className="text-lg font-black text-white hover:text-cyan">
            {dj.name}
          </Link>
          <p className="mt-1 text-sm text-muted">
            {dj.city}, {dj.country}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {dj.genres.slice(0, compact ? 2 : 3).map((genre) => (
              <GenrePill key={genre} label={genre} />
            ))}
          </div>
        </div>
      </div>
      {!compact && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted">
          <div><b className="text-white">{dj.followers.toLocaleString("es-CL")}</b> seguidores</div>
          <div><b className="text-white">{(dj.seenBy + (seen ? 1 : 0)).toLocaleString("es-CL")}</b> lo vieron</div>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <ActionButton active={followed} onClick={() => actions.toggleFollow(dj.slug)} icon={followed ? <Check size={16} /> : <Plus size={16} />}>
          {followed ? "Siguiendo" : "Seguir"}
        </ActionButton>
        <ActionButton active={seen} onClick={() => actions.toggleSeen(dj.slug)} icon={<Eye size={16} />}>
          {seen ? "Visto" : "Lo vi"}
        </ActionButton>
      </div>
    </article>
  );
}
