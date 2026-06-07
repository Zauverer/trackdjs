import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/auth-provider";
import "leaflet/dist/leaflet.css";
import "./globals.css";

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
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
