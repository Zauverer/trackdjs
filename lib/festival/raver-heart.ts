import type { FestivalSet } from "./route-engine";
import { toMinutes, formatClock } from "./route-engine";

export type CoverageSegment = { start: number; end: number };
export type DayCoverage = {
  day: string;
  start: number;
  end: number;
  totalMinutes: number;
  coveredMinutes: number;
  uncoveredMinutes: number;
  percent: number;
  segments: CoverageSegment[];
  gaps: CoverageSegment[];
  selectedSets: number;
  completed: boolean;
  startLabel: string;
  endLabel: string;
};

/**
 * Festival coverage is calculated from the first scheduled opening minute to
 * the last scheduled closing minute of the day. Only nonduplicated minutes
 * within selected "Voy" sets count as covered. Gaps and inter-stage walking
 * are NOT fabricated as covered time because real travel durations are unknown.
 * 0% = 0 covered minutes; 100% = every minute covered, without double-counting.
 */
export function raverHeartProgress(sets: FestivalSet[], ids: string[], day: string): DayCoverage {
  const daySets = sets.filter((s) => s.day === day);
  if (!daySets.length) {
    return {
      day, start: 0, end: 0, totalMinutes: 0, coveredMinutes: 0,
      uncoveredMinutes: 0, percent: 0, segments: [], gaps: [], selectedSets: 0,
      completed: false, startLabel: "--:--", endLabel: "--:--"
    };
  }
  const start = Math.min(...daySets.map((s) => toMinutes(s.start)));
  const end = Math.max(...daySets.map((s) => toMinutes(s.end)));
  const totalMinutes = Math.max(0, end - start);
  const chosen = new Set(ids);
  const selected = daySets.filter((s) => chosen.has(s.id));
  const sorted: CoverageSegment[] = selected.map((s) => ({
    start: Math.max(start, toMinutes(s.start)),
    end: Math.min(end, toMinutes(s.end))
  })).filter((s) => s.end > s.start).sort((a,b) => a.start - b.start || a.end - b.end);
  const segments: CoverageSegment[] = [];
  for (const s of sorted) {
    const previous = segments.at(-1);
    if (previous && previous.end >= s.start) previous.end = Math.max(previous.end, s.end);
    else segments.push({...s});
  }
  const coveredMinutes = segments.reduce((sum,s) => sum + s.end - s.start, 0);
  const gaps: CoverageSegment[] = [];
  let cursor = start;
  for (const seg of segments) {
    if (seg.start > cursor) gaps.push({start: cursor, end: seg.start});
    cursor = Math.max(cursor, seg.end);
  }
  if (cursor < end) gaps.push({start: cursor, end});
  const percent = totalMinutes ? Math.min(100, Math.round(100 * coveredMinutes / totalMinutes)) : 0;
  return {
    day, start, end, totalMinutes, coveredMinutes,
    uncoveredMinutes: Math.max(0, totalMinutes - coveredMinutes),
    percent, segments, gaps, selectedSets: selected.length,
    completed: totalMinutes > 0 && coveredMinutes === totalMinutes,
    startLabel: formatClock(start), endLabel: formatClock(end)
  };
}

/** The clock has its OWN 0–100% progress independent of saved lineup coverage. */
export function clockProgress(minute: number, firstMinute: number, finalMinute: number) {
  const duration = finalMinute - firstMinute;
  if (duration <= 0) return 0;
  return Math.round(100 * Math.max(0, Math.min(1, (minute - firstMinute) / duration)));
}
