import type { Attendance, MusicStyle } from "./music-discovery";
import { getStyles } from "./music-discovery";

export type FestivalSet = {
  id: string; day: string; stage: string; artist: string; start: string; end: string;
};
export type AttendanceMap = Record<string, Attendance>;
export type RouteStep = FestivalSet & { score: number; reason: string };
export type RouteWarning = { first: FestivalSet; second: FestivalSet; message: string };

export function toMinutes(clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + m;
}
export function formatClock(minutes: number): string {
  return Math.floor(minutes / 60).toString().padStart(2, "0") + ":" +
    Math.floor(minutes % 60).toString().padStart(2, "0");
}
export function intersects(a: FestivalSet, b: FestivalSet): boolean {
  return a.day === b.day && toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}
export function getAttendanceConflicts(allSets: FestivalSet[], attendance: AttendanceMap): RouteWarning[] {
  const chosen = allSets.filter((s) => attendance[s.id] === "voy");
  const warnings: RouteWarning[] = [];
  for (let i = 0; i < chosen.length; i++) {
    for (let j = i + 1; j < chosen.length; j++) {
      if (intersects(chosen[i], chosen[j])) {
        warnings.push({first:chosen[i], second:chosen[j], message: "Se superponen los horarios"});
      }
    }
  }
  return warnings;
}
export function getTightStageChanges(route: RouteStep[]): RouteWarning[] {
  const warnings: RouteWarning[] = [];
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i];
    if (a.stage !== b.stage && toMinutes(b.start) - toMinutes(a.end) < 15) {
      warnings.push({ first: a, second: b, message: "Cambio de stage con menos de 15 min; comprueba el recorrido real" });
    }
  }
  return warnings;
}

/** Weighted interval scheduling; no invented physical walking times or route coordinates. */
export function suggestRoute(allSets: FestivalSet[], day: string, attendance: AttendanceMap, taste: MusicStyle[]): RouteStep[] {
  const liked = new Set(taste);
  const eligible = allSets
    .filter((s) => s.day === day && attendance[s.id] !== "no")
    .map((s) => {
      const styles = getStyles(s.artist);
      const match = styles.filter((style) => liked.has(style)).length;
      const state = attendance[s.id];
      const score = (state === "voy" ? 80 : state === "talvez" ? 25 : 0) + Math.min(match, 2) * 18;
      const reason = state === "voy" ? "Marcaste Voy" : state === "talvez" ? "Tal vez" : match ? "Coincide con tus estilos" : "";
      return { ...s, score, reason } as RouteStep;
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => toMinutes(a.end) - toMinutes(b.end) || toMinutes(a.start) - toMinutes(b.start));
  if (!eligible.length) return [];
  type Candidate = { score: number; path: RouteStep[] };
  const dp: Candidate[] = [];
  for (let i = 0; i < eligible.length; i++) {
    const current = eligible[i];
    let best: Candidate = {score: current.score, path:[current]};
    for (let j = 0; j < i; j++) {
      const prev = eligible[j];
      if (toMinutes(prev.end) > toMinutes(current.start)) continue;
      const penalty = prev.stage === current.stage ? 0 : 3;
      const candidateScore = dp[j].score + current.score - penalty;
      if (candidateScore > best.score) {
        best = {score: candidateScore, path: [...dp[j].path, current]};
      }
    }
    dp.push(best);
  }
  const highest = dp.reduce((a,b) => a.score >= b.score ? a : b);
  return highest.path.sort((a,b) => toMinutes(a.start) - toMinutes(b.start));
}

/** Compact 86-set invitation token. Contains only selected set IDs, never email or identity. */
export function encodeSelection(ids: string[], allSets: FestivalSet[]): string {
  const selected = new Set(ids);
  const bytes = new Uint8Array(Math.ceil(allSets.length / 8));
  allSets.forEach((item, index) => {
    if (selected.has(item.id)) bytes[index >> 3] |= (1 << (index & 7));
  });
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
export function decodeSelection(token: string | null, allSets: FestivalSet[]): string[] {
  if (!token || !/^[A-Za-z0-9_-]{1,32}$/.test(token)) return [];
  try {
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
    if (binary.length !== Math.ceil(allSets.length / 8)) return [];
    return allSets.filter((_,index) => (binary.charCodeAt(index >> 3) & (1 << (index & 7))) !== 0).map((s) => s.id);
  } catch { return []; }
}
export function calculateMatch(myIds: string[], friendIds: string[]) {
  const a = new Set(myIds), b = new Set(friendIds);
  const matches = [...a].filter((id) => b.has(id));
  const score = a.size + b.size ? Math.round(200 * matches.length / (a.size + b.size)) : 0;
  return {matches, score, myCount: a.size, friendCount: b.size};
}
