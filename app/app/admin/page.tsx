import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { PageViewTracker } from "@/components/page-view-tracker";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export const metadata: Metadata = {
  title: "Admin",
  description: "Panel admin base preparado para Supabase."
};

const sections = ["DJs", "Eventos", "Venues", "Productoras", "Crear evento"];

export default function AdminPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-8">
      <PageViewTracker event="admin_opened" />
      <section className="glass rounded-lg p-6">
        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-pulse"><ShieldAlert size={16} /> Admin</p>
        <h1 className="mt-3 text-4xl font-black text-white">Panel editorial TrackDJs</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          {configured ? "Backend detectado. Falta conectar sesión, roles y acciones seguras." : "Admin backend pendiente de conexión. Esta UI queda preparada para Sprint 5B."}
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {sections.map((section) => (
          <div key={section} className="glass rounded-lg p-4">
            <h2 className="font-black text-white">{section}</h2>
            <p className="mt-2 text-sm text-muted">Vista base sin acciones destructivas.</p>
          </div>
        ))}
      </section>
    </div>
  );
}
