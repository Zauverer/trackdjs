import type { Metadata } from "next";
import Link from "next/link";
import { AudioLines } from "lucide-react";
import CreamfieldsPlanner from "@/components/festival/creamfields-planner";

export const metadata: Metadata = {
  title: "Crea tu lineup de Creamfields Chile 2026 | TrackDJs",
  description: "Elige artistas, detecta cruces y comparte tu lineup por WhatsApp. Sin registro obligatorio.",
  robots: { index: true, follow: true }
};

export default function CreamfieldsPublicPage() {
  return <div className="min-h-screen bg-[#080a12]">
    <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 px-4 py-5">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-white"><span className="rounded-xl bg-cyan p-2 text-[#080a12]"><AudioLines size={20} /></span> TrackDJs</Link>
      <Link href="/app" className="text-sm font-medium text-zinc-400 transition hover:text-white">Explorar TrackDJs <span aria-hidden="true">↗</span></Link>
    </header>
    <CreamfieldsPlanner />
  </div>;
}
