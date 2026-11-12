import type { Metadata } from "next";
import Link from "next/link";
import { AudioLines } from "lucide-react";
import CreamfieldsPlanner from "@/components/festival/creamfields-planner";
import festival from "@/lib/festival/creamfields-2026.json";
import { decodeSelection, type FestivalSet } from "@/lib/festival/route-engine";

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<{ invite?: string; compare?: string }>;
}): Promise<Metadata> {
  const params=await searchParams;
  const token=params.invite??(params.compare?.split(".")[0]??"");
  const count=decodeSelection(token,festival.sets as FestivalSet[]).length;
  const title=count?"¿Cuántos sets compartimos? | TrackDJs":"Crea tu lineup de Creamfields Chile 2026 | TrackDJs";
  const description=count?"Tu amigo eligió "+count+" sets de Creamfields. Elige los tuyos y descubre dónde coinciden.":"Elige artistas, arma tu ruta animada y comparte tu lineup por WhatsApp. Sin registro obligatorio.";
  const og="/api/og"+(token?"?invite="+encodeURIComponent(token):"");
  return {title,description,robots:{index:true,follow:true},
    openGraph:{title,description,url:"https://trackdjs.com/creamfields-2026",images:[{url:og,width:1200,height:630,alt:"Crea y compara tu lineup de Creamfields en TrackDJs"}]},
    twitter:{card:"summary_large_image",title,description,images:[og]}
  };
}

export default function CreamfieldsPublicPage() {
  return <div className="min-h-screen bg-[#080a12]">
    <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 px-4 py-5">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-white"><span className="rounded-xl bg-cyan p-2 text-[#080a12]"><AudioLines size={20} /></span> TrackDJs</Link>
      <Link href="/app" className="text-sm font-medium text-zinc-400 transition hover:text-white">Explorar TrackDJs <span aria-hidden="true">↗</span></Link>
    </header>
    <CreamfieldsPlanner />
  </div>;
}
