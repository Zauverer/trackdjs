import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { PrivacyAwareShell } from "@/components/privacy-aware-shell";
import "leaflet/dist/leaflet.css";
import "./globals.css";

/**
 * Self-hosted through next/font. Before this, globals.css asked for Inter and nothing
 * ever loaded it, so every visitor saw their own system font.
 */
const display = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap"
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "TrackDJs — Tu identidad electrónica",
    template: "%s | TrackDJs"
  },
  description: "Sigue DJs, descubre fiestas, guarda lineups y construye tu historial de DJs vistos.",
  applicationName: "TrackDJs",
  metadataBase: new URL("https://trackdjs.com"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg"
  },
  openGraph: {
    title: "TrackDJs — Tu identidad electrónica",
    description: "Sigue DJs, descubre fiestas, guarda lineups y construye tu historial de DJs vistos.",
    url: "https://trackdjs.com",
    siteName: "TrackDJs",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackDJs — Tu identidad electrónica",
    description: "Sigue DJs, descubre fiestas, guarda lineups y construye tu historial de DJs vistos."
  }
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="antialiased">
        <PrivacyAwareShell>{children}</PrivacyAwareShell>
      </body>
    </html>
  );
}
