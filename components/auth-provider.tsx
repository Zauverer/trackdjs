"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/auth/profile";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthContextValue = {
  loading: boolean;
  error: string | null;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  retryAuth: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const loadProfile = useCallback(async (user: User | null) => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }

    const { data, error } = await withTimeout(
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      9000,
      "profile_load_timeout"
    );

    if (error) {
      console.error("Profile load error", error);
      setProfile(null);
      throw error;
    }

    if (!data) {
      const created = await withTimeout(ensureProfile(supabase, user), 9000, "profile_setup_timeout");
      setProfile(created ?? null);
      return;
    }

    setProfile(data ?? null);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user ?? null);
  }, [loadProfile, session?.user]);

  const retryAuth = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    setLoading(true);
    setError(null);

    withTimeout(supabase.auth.getSession(), 9000, "session_load_timeout").then(async ({ data }) => {
      try {
        if (!mounted) return;
        setSession(data.session);
        if (data.session?.user) {
          try {
            await withTimeout(ensureProfile(supabase, data.session.user), 9000, "profile_setup_timeout");
          } catch (error) {
            console.error("Profile setup error", error);
            setError("No pudimos preparar tu perfil. Reintenta o vuelve a entrar.");
            // The callback route also retries profile creation after Magic Link.
          }
        }
        try {
          await loadProfile(data.session?.user ?? null);
        } catch {
          setError("Error al cargar perfil. Reintenta o vuelve a entrar.");
        }
      } catch (error) {
        console.error("Session load error", error);
        if (mounted) {
          setSession(null);
          setProfile(null);
          setError("No pudimos cargar tu sesión. Reintenta o vuelve a entrar.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setError(null);
      void loadProfile(nextSession?.user ?? null).catch((error) => {
        console.error("Auth state profile load error", error);
        setError("Error al cargar perfil. Reintenta o vuelve a entrar.");
      });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile, retryKey, supabase]);

  const logout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    window.location.href = "/app";
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ loading, error, session, user: session?.user ?? null, profile, refreshProfile, retryAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useSession must be used inside AuthProvider");
  return value;
}

export function useCurrentUser() {
  const { user, profile, loading } = useSession();
  return { user, profile, loading };
}

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(label)), timeoutMs);
    })
  ]);
}
