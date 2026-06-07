"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/is-configured";
import type { Database } from "@/lib/supabase/types";

export function createSupabaseBrowserClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  return createBrowserClient<Database>(env.url, env.anonKey);
}
