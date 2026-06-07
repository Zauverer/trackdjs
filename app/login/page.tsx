import type { Metadata } from "next";
import { MagicLinkForm } from "@/components/magic-link-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entra a TrackDJs con un enlace mágico por email."
};

export default function LoginPage() {
  return <MagicLinkForm mode="login" />;
}
