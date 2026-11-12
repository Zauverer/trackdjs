import type { FestivalSet } from "./route-engine";
import { toMinutes } from "./route-engine";

/**
 * Raver Heart is a transparent daily planning milestone, not a judgement
 * of the person or their health. 100% means four non-overlapping "Voy"
 * sets on the selected day. It never rewards selecting conflicting sets.
 */
export const RAVER_HEART_DAILY_GOAL = 4;
export function raverHeartProgress(sets:FestivalSet[],ids:string[],day:string){
  const chosen=new Set(ids);
  const candidates=sets.filter(s=>s.day===day&&chosen.has(s.id))
    .sort((a,b)=>toMinutes(a.end)-toMinutes(b.end)||toMinutes(a.start)-toMinutes(b.start));
  let lastEnd=-1,count=0;
  for(const s of candidates){
    const start=toMinutes(s.start),end=toMinutes(s.end);
    if(start>=lastEnd){count++;lastEnd=end;}
  }
  const percent=Math.min(100,Math.round(100*count/RAVER_HEART_DAILY_GOAL));
  return {validSets:count,selectedSets:candidates.length,goal:RAVER_HEART_DAILY_GOAL,percent,completed:count>=RAVER_HEART_DAILY_GOAL};
}
