"use client";

import type { Event } from "@/types";
import { useSetReminders } from "@/lib/use-set-reminders";

export function Timetable({ event }: { event: Event }) {
  const { isReminderActive, toggleReminder } = useSetReminders();

  return (
    <div className="space-y-3">
      {event.timetable.map((slot) => (
        <div key={`${slot.time}-${slot.artist}`} className="glass grid grid-cols-[72px_1fr] items-center gap-3 rounded-lg p-3">
          <div className="text-sm font-black text-cyan">{slot.time}</div>
          <div>
            <div className="font-bold text-white">{slot.artist}</div>
            <div className="text-xs text-muted">{slot.stage}{slot.endTime ? ` · hasta ${slot.endTime}` : ""}</div>
            <button
              type="button"
              onClick={() => toggleReminder(`${event.slug}:${slot.stage}:${slot.time}:${slot.artist}`)}
              className={`mt-2 rounded-md border px-3 py-1 text-xs font-black ${isReminderActive(`${event.slug}:${slot.stage}:${slot.time}:${slot.artist}`) ? "border-success/40 bg-success/10 text-success" : "border-white/10 bg-white/[0.04] text-zinc-300"}`}
            >
              {isReminderActive(`${event.slug}:${slot.stage}:${slot.time}:${slot.artist}`) ? "Recordatorio activado" : "Recordarme este set"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
