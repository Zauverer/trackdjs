import type { Metadata } from "next";
import { RadarView } from "@/components/radar-view";
import { getEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Radar",
  description: "Mapa de eventos electrónicos cerca de ti."
};

export default function AppHomePage() {
  return <RadarView events={getEvents()} />;
}
