"use client";

import { useLocalStorage } from "@/lib/use-local-storage";
import { useSession } from "@/components/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { setRemoteSetReminder } from "@/lib/repositories/user-actions-repository";

const REMINDER_KEY = "trackdjs:set-reminders:v1";

type ReminderState = {
  reminders: string[];
};

export function useSetReminders() {
  const { value, setValue } = useLocalStorage<ReminderState>(REMINDER_KEY, { reminders: [] });
  const { user } = useSession();
  const supabase = createSupabaseBrowserClient();

  const toggleReminder = (id: string) => {
    const active = value.reminders.includes(id);
    const nextActive = !active;
    setValue({
      reminders: active ? value.reminders.filter((item) => item !== id) : [...value.reminders, id]
    });
    if (!user && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trackdjs:auth-gate"));
    }
    if (user && supabase) {
      void setRemoteSetReminder(supabase as never, user, id, nextActive).catch((error) => console.error("Set reminder sync error", error));
    }
  };

  return {
    reminders: value.reminders,
    isReminderActive: (id: string) => value.reminders.includes(id),
    toggleReminder
  };
}
