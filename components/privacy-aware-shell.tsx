"use client";

import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/auth-provider";

/** No analytics or Supabase browser session on the guest festival planner. */
export function PrivacyAwareShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const guestPlanner = pathname === "/" || pathname === "/creamfields-2026";
  if (guestPlanner) return <>{children}</>;
  return <AuthProvider>{children}<Analytics /></AuthProvider>;
}
