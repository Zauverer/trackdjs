"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/components/auth-provider";
import { SectionHeader } from "@/components/section-header";
import { useSetReminders } from "@/lib/use-set-reminders";
import { getTrackMigrationDebug, useTrackState } from "@/lib/use-track-state";

export default function UserActionsDebugPage() {
  const { loading, user, profile } = useSession();
  const { state, remoteLoading, actionError } = useTrackState();
  const { reminders } = useSetReminders();
  const migration = useMemo(() => getTrackMigrationDebug(), []);

  if (loading) {
    return (
      <section className="glass rounded-lg p-6">
        <h1 className="flex items-center gap-3 text-3xl font-black text-white"><Loader2 className="animate-spin text-cyan" /> Cargando debug...</h1>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="glass rounded-lg p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">QA interno</p>
        <h1 className="mt-3 text-3xl font-black text-white">Entra para ver tus acciones.</h1>
        <p className="mt-2 text-muted">Esta pantalla solo muestra datos propios de la sesión actual.</p>
        <Link href="/login" className="mt-5 inline-flex rounded-md bg-white px-4 py-3 text-sm font-black text-void">Entrar</Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Debug de acciones" description="Vista personal para QA de Supabase, localStorage y migración." />
      <section className="grid gap-4 lg:grid-cols-2">
        <DebugPanel title="Sesión" rows={[
          ["user id", user.id],
          ["email", user.email ?? "sin email"],
          ["username", profile?.username ?? "sin username"],
          ["remote loading", String(remoteLoading)],
          ["último error acción", actionError ?? "sin error"]
        ]} />
        <DebugPanel title="Migración localStorage" rows={[
          ["localStorage detected", String(migration.localStorageDetected)],
          ["migration hash", migration.hash ?? "sin hash"],
          ["choice", migration.choice ?? "sin decisión"],
          ["dismissed at", migration.dismissedAt ?? "sin fecha"],
          ["saved at", migration.savedAt ?? "sin fecha"]
        ]} />
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <ListPanel title="DJs seguidos" items={state.followedDjs} />
        <ListPanel title="DJs vistos" items={state.seenDjs} />
        <ListPanel title="Wishlist DJs" items={state.wantToSeeDjs} />
        <ListPanel title="Eventos interested" items={state.interestedEvents} />
        <ListPanel title="Eventos going" items={state.goingEvents} />
        <ListPanel title="Eventos attended" items={state.attendedEvents} />
        <ListPanel title="Eventos saved" items={state.savedEvents} />
        <ListPanel title="Recordatorios" items={reminders} />
      </section>
    </div>
  );
}

function DebugPanel({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="glass rounded-lg p-4">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[140px_1fr] gap-3 border-b border-white/5 pb-2">
            <span className="font-bold text-muted">{label}</span>
            <span className="break-all text-zinc-200">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass rounded-lg p-4">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? items.map((item) => <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-zinc-200">{item}</span>) : <span className="text-sm text-muted">vacío</span>}
      </div>
    </div>
  );
}
