import Link from "next/link";
import { ArrowRight, BadgeCheck, Bookmark, Eye, Radio, Share2, Sparkles, Users } from "lucide-react";
import { Brand } from "@/components/brand";
import { BadgeCard } from "@/components/badge-card";
import { EventCard } from "@/components/event-card";
import { GenrePill } from "@/components/genre-pill";
import { badges, djs, events } from "@/lib/data";
import { contact } from "@/lib/contact";

const features = [
  { title: "Crea tu identidad electrónica", text: "Tu perfil musical empieza con cada noche que recuerdas.", icon: Radio },
  { title: "Descubre próximas fiestas", text: "Mapa, fechas y lineups para decidir dónde bailar.", icon: Bookmark },
  { title: "Marca los DJs que viste", text: "Cada set suma a tu historial de escena.", icon: Eye },
  { title: "Construye tu historial de escena", text: "Guarda eventos, sigue artistas y arma tu recorrido.", icon: Users },
  { title: "Compartir badges", text: "Convierte tu recorrido musical en senales sociales.", icon: Share2 }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Brand />
        <Link href="/app" className="rounded-md border border-white/10 bg-white px-4 py-2 text-sm font-black text-void transition hover:bg-cyan">
          Entrar
        </Link>
      </header>

      <main>
        <section className="noise relative mx-auto grid min-h-[calc(100vh-84px)] max-w-6xl content-center gap-10 px-4 pb-16 pt-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan">
              <Sparkles size={14} /> Red social para cultura electronica
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
              Tu identidad electronica empieza aqui.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
              Crea tu identidad electrónica, marca los DJs que viste y descubre próximas fiestas. Tu Track empieza hoy.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/app" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 font-black text-void transition hover:bg-cyan">
                Entrar a la beta <ArrowRight size={18} />
              </Link>
              <Link href="/app/events" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-5 py-3 font-bold text-white transition hover:border-neon/60">
                Ver eventos
              </Link>
            </div>
          </div>

          <div className="relative z-10">
            <div className="glass mx-auto max-w-sm rounded-lg p-4 shadow-glow">
              <div className="rounded-lg bg-gradient-to-br from-neon via-pulse to-cyan p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Mi Track</span>
                  <BadgeCheck size={22} />
                </div>
                <div className="mt-12 text-6xl font-black">38</div>
                <p className="text-lg font-bold">DJs vistos</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-white/[0.04] p-4">
                  <div className="text-2xl font-black">14</div>
                  <p className="text-xs text-muted">fiestas asistidas</p>
                </div>
                <div className="rounded-md bg-white/[0.04] p-4">
                  <div className="text-sm font-black">Melodic Techno</div>
                  <p className="text-xs text-muted">genero principal</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {djs.slice(0, 4).map((dj) => <GenrePill key={dj.slug} label={dj.name} />)}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-3xl font-black text-white">Que puedes hacer</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="glass rounded-lg p-4">
                  <Icon className="text-cyan" size={22} />
                  <h3 className="mt-4 font-black text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="glass grid gap-6 rounded-lg p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-success">TrackDJs está en beta</p>
              <h2 className="mt-2 text-3xl font-black text-white">Estamos construyendo la red social para la escena electrónica.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-zinc-300">
                Explora la primera versión, prueba el mapa, marca tus DJs vistos y ayúdanos a darle forma antes del lanzamiento público.
              </p>
            </div>
            <Link href="/beta" className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 py-3 font-black text-void hover:bg-cyan">
              Ver beta
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-pulse">Proximas noches</p>
              <h2 className="mt-2 text-3xl font-black text-white">Eventos destacados</h2>
            </div>
            <Link href="/app/events" className="hidden text-sm font-bold text-cyan sm:block">Ver todos</Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {events.slice(0, 3).map((event) => <EventCard key={event.slug} event={event} featured />)}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-3xl font-black text-white">Badges que cuentan escena</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {badges.slice(0, 4).map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-muted">
        TrackDJs © 2026 · <a className="text-cyan" href={`mailto:${contact.email}`}>{contact.email}</a> · {contact.instagram}
      </footer>
    </div>
  );
}
