import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export const metadata: Metadata = {
  title: "Signup",
  description: "Registro beta preparado para Supabase Auth."
};

export default function SignupPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <section className="glass rounded-lg p-6">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-pulse">Crear cuenta</p>
        <h1 className="mt-3 text-4xl font-black text-white">Reserva tu identidad electrónica</h1>
        <p className="mt-3 leading-7 text-muted">
          {configured ? "Supabase está configurado. El registro real se activará cuando conectemos las acciones." : "La autenticación real se activará en la próxima versión."}
        </p>
        <div className="mt-6 space-y-3">
          <input aria-label="Email" type="email" placeholder="email" className="h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan" />
          <input aria-label="Alias" type="text" placeholder="alias de escena" className="h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan" />
          <button disabled type="button" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-4 font-black text-void disabled:cursor-not-allowed disabled:opacity-60">
            <Sparkles size={18} /> Signup preparado
          </button>
        </div>
      </section>
      <Link href="/app" className="inline-flex text-sm font-bold text-cyan">Entrar sin cuenta por ahora</Link>
    </div>
  );
}
