"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/is-configured";

export function MagicLinkForm({ mode = "login" }: { mode?: "login" | "signup" }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const env = getSupabaseEnv();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!supabase || !env) {
      setStatus("error");
      setMessage("Supabase no está configurado en este entorno.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const redirectTo = `${env.siteUrl.replace(/\/$/, "")}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "No pudimos enviar el enlace. Intenta de nuevo.");
      return;
    }

    setStatus("success");
    setMessage("Revisa tu correo para entrar a TrackDJs.");
  }

  const title = mode === "signup" ? "Crea tu cuenta en TrackDJs" : "Entrar a TrackDJs";
  const eyebrow = mode === "signup" ? "Crear cuenta" : "Acceso";
  const Icon = mode === "signup" ? Sparkles : Mail;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <section className="glass rounded-lg p-6">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black text-white">{title}</h1>
        <p className="mt-3 leading-7 text-muted">Te enviaremos un enlace para entrar a TrackDJs.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block text-sm font-bold text-white" htmlFor="email">Email</label>
          <input
            id="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            className="h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan"
          />
          <button disabled={status === "loading"} type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-4 font-black text-void disabled:cursor-not-allowed disabled:opacity-60">
            <Icon size={18} /> {status === "loading" ? "Enviando..." : "Entrar con magic link"}
          </button>
        </form>

        {message ? (
          <p className={`mt-4 rounded-md border px-3 py-2 text-sm ${status === "error" ? "border-pulse/30 bg-pulse/10 text-pulse" : "border-success/30 bg-success/10 text-success"}`}>
            {message}
          </p>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-3 text-sm font-bold">
        <Link href="/app" className="text-cyan">Explorar sin cuenta</Link>
        <Link href={mode === "signup" ? "/login" : "/signup"} className="text-muted hover:text-white">
          {mode === "signup" ? "Ya tengo cuenta" : "Crear cuenta"}
        </Link>
      </div>
    </div>
  );
}
