"use client";

import { useLocalStorage } from "@/lib/use-local-storage";

const REMINDER_KEY = "trackdjs:set-reminders:v1";

type ReminderState = {
  reminders: string[];
};

export function useSetReminders() {
  const { value, setValue } = useLocalStorage<ReminderState>(REMINDER_KEY, { reminders: [] });

  const toggleReminder = (id: string) => {
    const active = value.reminders.includes(id);
    setValue({
      reminders: active ? value.reminders.filter((item) => item !== id) : [...value.reminders, id]
    });
  };

  return {
    reminders: value.reminders,
    isReminderActive: (id: string) => value.reminders.includes(id),
    toggleReminder
  };
}
