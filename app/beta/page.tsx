import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Mail, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { PageViewTracker } from "@/components/page-view-tracker";
import { contact } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Beta",
  description: "Prueba la beta de TrackDJs y ayúdanos a construir la red social para la escena electrónica."
};

const ready = ["Mapa de fiestas", "DJs y perfiles básicos", "Mi Track con DJs vistos", "Eventos guardados", "Timeline de próximas fechas"];
const next = ["Cuentas de usuario", "Datos reales en Supabase", "Panel para productoras", "Perfiles reclamables para DJs", "Alertas y calendario"];

export default function BetaPage() {
  return (
    <div className="min-h-screen">
      <PageViewTracker event="beta_opened" />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Brand />
        <Link href="/app" className="rounded-md bg-white px-4 py-2 text-sm font-black text-void hover:bg-cyan">Entrar</Link>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="glass rounded-lg p-6 md:p-8">
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-cyan"><Sparkles size={16} /> Beta pública</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight text-white">Ayúdanos a darle forma a TrackDJs.</h1>
          <p className="mt-4 max-w-2xl leading-8 text-zinc-300">
            Estamos construyendo la red social para fans, DJs, productoras y venues de la escena electrónica. Esta beta permite probar el concepto antes de conectar backend real.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/app" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 font-black text-void hover:bg-cyan">
              Entrar a la beta <ArrowRight size={18} />
            </Link>
            <a href={`mailto:${contact.email}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/10 px-5 py-3 font-bold text-white hover:border-cyan/50">
              <Mail size={18} /> ¿Quieres aparecer?
            </a>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-lg p-5">
            <h2 className="text-2xl font-black text-white">Ya puedes probar</h2>
            <div className="mt-4 space-y-3">
              {ready.map((item) => <p key={item} className="flex items-center gap-2 text-zinc-300"><CheckCircle2 className="text-success" size={18} /> {item}</p>)}
            </div>
          </div>
          <div className="glass rounded-lg p-5">
            <h2 className="text-2xl font-black text-white">Lo que viene</h2>
            <div className="mt-4 space-y-3">
              {next.map((item) => <p key={item} className="flex items-center gap-2 text-zinc-300"><CheckCircle2 className="text-cyan" size={18} /> {item}</p>)}
            </div>
          </div>
        </section>

        <section className="mt-8 glass rounded-lg p-5">
          <h2 className="text-2xl font-black text-white">DJs, productoras y venues</h2>
          <p className="mt-2 leading-7 text-zinc-300">
            ¿Quieres aparecer en TrackDJs? Escríbenos a <a className="font-bold text-cyan" href={`mailto:${contact.email}`}>{contact.email}</a> o búscanos como {contact.instagram}.
          </p>
        </section>
      </main>
    </div>
  );
}
