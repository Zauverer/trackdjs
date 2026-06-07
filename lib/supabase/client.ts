"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/is-configured";

export function createSupabaseBrowserClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  return createBrowserClient(env.url, env.anonKey);
}
