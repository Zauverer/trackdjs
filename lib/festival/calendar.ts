import type { FestivalSet } from "./route-engine";
function stamp(day:string, clock:string) {return day.replace(/-/g,"")+"T"+clock.replace(":","")+"00";}
export function googleCalendarUrl(set:FestivalSet) {
  const params=new URLSearchParams({
    action:"TEMPLATE",
    text: set.artist+" · Creamfields Chile 2026",
    dates:stamp(set.day,set.start)+"/"+stamp(set.day,set.end),
    ctz:"America/Santiago",
    details:"Horario referencial. Confirma el programa y el acceso al stage en fuentes oficiales. Evento creado desde TrackDJs (no oficial).",
    location:set.stage+" · Club Hípico de Santiago, Chile"
  });
  return "https://calendar.google.com/calendar/render?"+params.toString();
}
function escapeIcs(text:string) {return text.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");}
export function makeIcs(sets:FestivalSet[]) {
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//TrackDJs//Creamfields Route//ES","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Mi Creamfields 2026"];
  sets.forEach((s)=>{
    lines.push("BEGIN:VEVENT","UID:"+s.id+"@trackdjs.com","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,""),
      "DTSTART;TZID=America/Santiago:"+stamp(s.day,s.start),"DTEND;TZID=America/Santiago:"+stamp(s.day,s.end),
      "SUMMARY:"+escapeIcs(s.artist+" · Creamfields"),
      "LOCATION:"+escapeIcs(s.stage+" · Club Hípico, Santiago"),
      "DESCRIPTION:"+escapeIcs("Horario referencial, no oficial. Verificar cambios antes del festival."),
      "BEGIN:VALARM","TRIGGER:-PT15M","ACTION:DISPLAY","DESCRIPTION:"+escapeIcs("Próximo set: "+s.artist),
      "END:VALARM","END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n")+"\r\n";
}
export function downloadIcs(sets:FestivalSet[]) {
  if(typeof document==="undefined"||!sets.length)return;
  const blob=new Blob([makeIcs(sets)],{type:"text/calendar;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="mi-creamfields-2026.ics";a.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),30000);
}
