import type { Metadata } from "next";
import { MagicLinkForm } from "@/components/magic-link-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de TrackDJs con un enlace mágico por email."
};

export default function SignupPage() {
  return <MagicLinkForm mode="signup" />;
}
