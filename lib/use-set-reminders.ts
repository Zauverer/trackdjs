"use client";

import { useLocalStorage } from "@/lib/use-local-storage";
import { useSession } from "@/components/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { setRemoteSetReminder } from "@/lib/repositories/user-actions-repository";
import { useMemo, useState } from "react";

const REMINDER_KEY = "trackdjs:set-reminders:v1";

type ReminderState = {
  reminders: string[];
};

export function useSetReminders() {
  const { value, setValue } = useLocalStorage<ReminderState>(REMINDER_KEY, { reminders: [] });
  const { user } = useSession();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [pendingReminders, setPendingReminders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleReminder = (id: string) => {
    const active = value.reminders.includes(id);
    const nextActive = !active;
    const previous = value;
    const next = {
      reminders: active ? value.reminders.filter((item) => item !== id) : [...value.reminders, id]
    };
    setValue(next);
    setError(null);
    if (!user && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trackdjs:auth-gate"));
    }
    if (user && supabase) {
      setPendingReminders((current) => [...new Set([...current, id])]);
      void setRemoteSetReminder(supabase as never, user, id, nextActive)
        .catch((error) => {
          console.error("Set reminder sync error", { id, error });
          setValue(previous);
          setError("No pudimos guardar este recordatorio. Intenta nuevamente.");
        })
        .finally(() => setPendingReminders((current) => current.filter((item) => item !== id)));
    }
  };

  return {
    reminders: value.reminders,
    isReminderActive: (id: string) => value.reminders.includes(id),
    isReminderPending: (id: string) => pendingReminders.includes(id),
    error,
    toggleReminder
  };
}
