import type { Metadata } from "next";
import CreamfieldsPlanner from "@/components/festival/creamfields-planner";

export const metadata: Metadata = { title: "Creamfields 2026 | TrackDJs", description: "Crea y comparte tu lineup personalizado de Creamfields Chile 2026." };
export default function Page() { return <CreamfieldsPlanner />; }
