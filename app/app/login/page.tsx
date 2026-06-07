import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export const metadata: Metadata = {
  title: "Login",
  description: "Acceso beta preparado para Supabase Auth."
};

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <section className="glass rounded-lg p-6">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">Acceso beta</p>
        <h1 className="mt-3 text-4xl font-black text-white">Entrar a TrackDJs</h1>
        <p className="mt-3 leading-7 text-muted">
          {configured ? "Supabase está configurado. Esta pantalla queda lista para activar auth real." : "La autenticación real se activará en la próxima versión."}
        </p>
        <div className="mt-6 space-y-3">
          <label className="block text-sm font-bold text-white" htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="tu@email.com" className="h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan" />
          <label className="block text-sm font-bold text-white" htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="••••••••" className="h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan" />
          <button disabled type="button" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-4 font-black text-void disabled:cursor-not-allowed disabled:opacity-60">
            <Mail size={18} /> Login preparado
          </button>
        </div>
      </section>
      <Link href="/app" className="inline-flex text-sm font-bold text-cyan">Volver a la app</Link>
    </div>
  );
}
