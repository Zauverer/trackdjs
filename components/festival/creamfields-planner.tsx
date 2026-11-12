"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Heart, Headphones, ListMusic, Map, Music2, PlayCircle, Search, Share2, ShoppingBag, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import AnimatedRoute from "@/components/festival/animated-route";
import festival from "@/lib/festival/creamfields-2026.json";
import { getStyles, LICENSED_ARTIST_IMAGES, OPEN_ARTIST_LOGOS, STAGE_META, STYLE_OPTIONS, spotifyArtistSearch, soundcloudSetSearch, type Attendance, type MusicStyle } from "@/lib/festival/music-discovery";
import { calculateMatch, decodeSelection, encodeSelection, getAttendanceConflicts, suggestRoute, type AttendanceMap, type FestivalSet } from "@/lib/festival/route-engine";
import { downloadIcs, googleCalendarUrl } from "@/lib/festival/calendar";
import { raverHeartProgress } from "@/lib/festival/raver-heart";

const sets = festival.sets as FestivalSet[];
const STORAGE_KEY = "trackdjs:creamfields:lineup:v2";
const LEGACY_KEY = "trackdjs:creamfields:lineup:v1";
const DAY_LABELS: Record<string,string> = {"2026-11-14":"Sáb 14 NOV","2026-11-15":"Dom 15 NOV"};
const VERIFIED_PHOTOS = new Set(["CHARLOTTE DE WITTE","BORIS BREJCHA"]);
const MAX_SHARED = sets.length;
const ART_PALETTES = [
  "radial-gradient(circle at 30% 25%,#6c25e4 0%,#18154a 35%,#0d1021 100%)",
  "radial-gradient(circle at 70% 20%,#028f9a 0%,#153a55 34%,#0c1023 100%)",
  "radial-gradient(circle at 80% 35%,#b72d8e 0%,#321657 35%,#0c1123 100%)",
  "radial-gradient(circle at 35% 80%,#a3600d 0%,#34224c 40%,#090d21 100%)"
];

function dayName(day:string) {return DAY_LABELS[day]??day;}
function initials(name:string){return name.split(/\s+/).map(word=>word[0]).filter(Boolean).slice(0,3).join("");}
function safeNickname(name:string){return name.trim().replace(/[<>]/g,"").slice(0,22);}
function messageLink(link:string,friend:boolean){return (friend?"Te respondo con mi lineup y nuestro match 🎧":"🎧 ¡Te reto a armar tu lineup para Creamfields Chile 2026! Compara tus sets con los míos:")+"\n"+link;}
function inviteLink(ids:string[], nickname:string, includeNickname:boolean) {
  const url=new URL("/creamfields-2026",window.location.origin);
  url.searchParams.set("invite",encodeSelection(ids,sets));
  if(includeNickname&&nickname.trim())url.searchParams.set("n",safeNickname(nickname));
  return url.toString();
}
function pairLink(friendIds:string[],myIds:string[]) {
  const url=new URL("/creamfields-2026",window.location.origin);
  url.searchParams.set("compare",encodeSelection(friendIds,sets)+"."+encodeSelection(myIds,sets));
  return url.toString();
}
function savePoster(chosen:FestivalSet[],nickname:string){
  const c=document.createElement("canvas");c.width=1080;
  const dayCount=new Set(chosen.map(s=>s.day)).size;
  c.height=Math.max(1300,530+chosen.length*48+dayCount*105);
  const ctx=c.getContext("2d");if(!ctx)throw new Error("No canvas");
  const g=ctx.createLinearGradient(0,0,1080,c.height);
  g.addColorStop(0,"#14132e");g.addColorStop(.6,"#0a1830");g.addColorStop(1,"#080b13");
  ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle="#b8ff72";ctx.font="bold 36px Arial";ctx.fillText("TRACKDJS  /  FESTIVAL JOURNEY",64,94);
  ctx.fillStyle="#fff";ctx.font="bold 78px Arial";ctx.fillText("MI CREAMFIELDS",60,196);
  ctx.fillStyle="#aab7d2";ctx.font="30px Arial";ctx.fillText("14 — 15 NOV 2026 · SANTIAGO",65,256);
  if(nickname){ctx.fillStyle="#b8ff72";ctx.font="bold 30px Arial";ctx.fillText("@"+nickname,65,312);}
  let y=370;
  for(const day of festival.dates){
    const items=chosen.filter(s=>s.day===day).sort((a,b)=>a.start.localeCompare(b.start));
    if(!items.length)continue;
    ctx.fillStyle="#b8ff72";ctx.font="bold 34px Arial";ctx.fillText(dayName(day),65,y);y+=58;
    for(const s of items){
      ctx.fillStyle="#fff";ctx.font="bold 27px Arial";
      const name=s.artist.length>32?s.artist.slice(0,29)+"…":s.artist;
      ctx.fillText(name,65,y);
      ctx.fillStyle="#aebcd2";ctx.font="23px Arial";ctx.fillText(s.start+" · "+s.stage,575,y,440);y+=48;
    }
    y+=49;
  }
  ctx.fillStyle="#b8ff72";ctx.font="bold 30px Arial";ctx.fillText("ARMA TU RUTA EN TRACKDJS.COM",65,c.height-84);
  ctx.fillStyle="#8c9bb6";ctx.font="20px Arial";ctx.fillText("App independiente · Horarios referenciales · No oficial",65,c.height-40);
  return c;
}
async function makePoster(chosen:FestivalSet[],nickname:string){
  const c=savePoster(chosen,nickname);
  const blob=await new Promise<Blob>((resolve,reject)=>c.toBlob(v=>v?resolve(v):reject(new Error("PNG no disponible")),"image/png"));
  return new File([blob],"mi-lineup-creamfields-2026.png",{type:"image/png"});
}
async function downloadPoster(chosen:FestivalSet[],nickname:string){
  const file=await makePoster(chosen,nickname);
  const url=URL.createObjectURL(file);const a=document.createElement("a");
  a.href=url;a.download=file.name;a.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),30000);
}

export default function CreamfieldsPlanner(){
  const [accepted,setAccepted]=useState(false);
  const [agreementChecked,setAgreementChecked]=useState(false);
  const [privacyMode,setPrivacyMode]=useState(true);
  const [ids,setIds]=useState<string[]>([]);
  const [maybeIds,setMaybeIds]=useState<string[]>([]);
  const [noIds,setNoIds]=useState<string[]>([]);
  const [tastes,setTastes]=useState<MusicStyle[]>([]);
  const [friendIds,setFriendIds]=useState<string[]>([]);
  const [friendName,setFriendName]=useState("Tu amigo");
  const [nickname,setNickname]=useState("");
  const [includeNickname,setIncludeNickname]=useState(false);
  const [day,setDay]=useState("2026-11-14");
  const [search,setSearch]=useState("");
  const [stageFilter,setStageFilter]=useState("all");
  const [styleFilter,setStyleFilter]=useState<MusicStyle|"all">("all");
  const [view,setView]=useState<"gallery"|"stages">("gallery");
  const [showAnimation,setShowAnimation]=useState(false);
  const [showAdvanced,setShowAdvanced]=useState(false);
  const [photoConsent,setPhotoConsent]=useState(false);
  const [notice,setNotice]=useState("");
  const [cartPulse,setCartPulse]=useState<{seq:number;label:string}|null>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    if(!cartPulse)return;
    const timer=window.setTimeout(()=>setCartPulse(null),950);
    return()=>window.clearTimeout(timer);
  },[cartPulse]);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const friendParam=params.get("invite");
    const compare=params.get("compare")?.split(".");
    if(friendParam){
      setFriendIds(decodeSelection(friendParam,sets));
      setFriendName(safeNickname(params.get("n")??"")||"Tu amigo");
    }else if(compare?.length===2){
      setFriendIds(decodeSelection(compare[0],sets));
      setIds(decodeSelection(compare[1],sets));
      setFriendName("El otro lineup");
    }else if(params.has("lineup")){
      const valid=new Set(sets.map(s=>s.id));
      setIds([...(new Set((params.get("lineup")??"").split(",").filter(id=>valid.has(id))))].slice(0,MAX_SHARED));
    }
    if(!compare?.length&&!params.has("lineup")){
      try {
        const raw=localStorage.getItem(STORAGE_KEY)??localStorage.getItem(LEGACY_KEY);
        if(raw){
          const data=JSON.parse(raw) as {accepted?:boolean;privacyMode?:boolean;ids?:string[];maybeIds?:string[];noIds?:string[];tastes?:MusicStyle[];nickname?:string;includeNickname?:boolean};
          const valid=new Set(sets.map(s=>s.id));
          const clean=(a?:string[])=>Array.isArray(a)?a.filter(id=>valid.has(id)).slice(0,MAX_SHARED):[];
          if(data.accepted&&data.privacyMode===false){
            setAccepted(true);setPrivacyMode(false);
            setIds(clean(data.ids));setMaybeIds(clean(data.maybeIds));setNoIds(clean(data.noIds));
            setTastes((data.tastes??[]).filter(t=>STYLE_OPTIONS.some(style=>style.key===t)));
            setNickname(safeNickname(data.nickname??""));setIncludeNickname(Boolean(data.includeNickname));
          }
        }
      }catch{/* private mode / malformed data */}
    }
    setReady(true);
  },[]);
  useEffect(()=>{
    if(!ready)return;
    try {
      if(!accepted||privacyMode){
        localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_KEY);
      }else{
        localStorage.setItem(STORAGE_KEY,JSON.stringify({accepted:true,privacyMode:false,ids,maybeIds,noIds,tastes,nickname,includeNickname}));
        localStorage.removeItem(LEGACY_KEY);
      }
    }catch{setNotice("No se puede guardar en este navegador. Usa Compartir o el calendario.");}
  },[ready,accepted,privacyMode,ids,maybeIds,noIds,tastes,nickname,includeNickname]);

  const attendance=useMemo(()=>{
    const result:AttendanceMap={};
    ids.forEach(id=>{result[id]="voy";});
    maybeIds.forEach(id=>{result[id]="talvez";});
    noIds.forEach(id=>{result[id]="no";});
    return result;
  },[ids,maybeIds,noIds]);
  const selected=useMemo(()=>sets.filter(s=>ids.includes(s.id)).sort((a,b)=>a.day.localeCompare(b.day)||a.start.localeCompare(b.start)),[ids]);
  const stages=useMemo(()=>[...new Set(sets.filter(s=>s.day===day).map(s=>s.stage))],[day]);
  const visible=useMemo(()=>sets.filter(s=>{
    const matchesSearch=(s.artist+" "+s.stage+" "+getStyles(s.artist).join(" ")).toLowerCase().includes(search.toLowerCase());
    return s.day===day&&matchesSearch&&(stageFilter==="all"||s.stage===stageFilter)&&(styleFilter==="all"||getStyles(s.artist).includes(styleFilter));
  }).sort((a,b)=>a.start.localeCompare(b.start)),[day,search,stageFilter,styleFilter]);
  const conflicts=useMemo(()=>getAttendanceConflicts(sets,attendance),[attendance]);
  const myRoute=useMemo(()=>suggestRoute(sets,day,attendance,tastes),[day,attendance,tastes]);
  const match=useMemo(()=>calculateMatch(ids,friendIds),[ids,friendIds]);
  const hasInvitation=friendIds.length>0;
  const knownStyles=STYLE_OPTIONS.filter(style=>tastes.includes(style.key));
  const heart=useMemo(()=>raverHeartProgress(sets,ids,day),[ids,day]);
  const percentage=heart.percent;

  function setAttendance(id:string,value:Attendance|undefined){
    const wasGoing=ids.includes(id);
    const willGo=value==="voy";
    if(wasGoing!==willGo){
      setCartPulse(previous=>({seq:(previous?.seq??0)+1,label:willGo?"+1":"−1"}));
    }
    setIds(v=>v.filter(x=>x!==id));setMaybeIds(v=>v.filter(x=>x!==id));setNoIds(v=>v.filter(x=>x!==id));
    if(value==="voy")setIds(v=>[...v,id]);
    if(value==="talvez")setMaybeIds(v=>[...v,id]);
    if(value==="no")setNoIds(v=>[...v,id]);
  }
  function toggleTaste(style:MusicStyle){setTastes(v=>v.includes(style)?v.filter(x=>x!==style):[...v,style]);}
  function revoke(){
    setAccepted(false);setAgreementChecked(false);setPrivacyMode(true);setCartPulse(null);setIds([]);setMaybeIds([]);setNoIds([]);setTastes([]);setNickname("");setIncludeNickname(false);
    try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_KEY);}catch{}
    setNotice("Se eliminó la selección guardada en este navegador.");
  }
  async function share(){
    if(!selected.length){setNotice("Marca Voy al menos en un set para invitar a tus amigos.");return;}
    const link=inviteLink(ids,nickname,includeNickname);
    const text=messageLink(link,false);
    try{
      const file=await makePoster(selected,includeNickname?nickname:"");
      if(navigator.share&&navigator.canShare?.({files:[file]})){
        await navigator.share({files:[file],text,title:"¿Cuántos sets compartimos?"});
        setNotice("Imagen y enlace preparados para compartir.");
      }else{
        await downloadPoster(selected,includeNickname?nickname:"");
        window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank","noopener,noreferrer");
        setNotice("WhatsApp se abrió con tu invitación. Adjunta la imagen PNG descargada.");
      }
    }catch(error){if((error as Error).name!=="AbortError")setNotice("No se pudo compartir. Usa Copiar enlace.");}
  }
  async function copyLink(){
    if(!ids.length){setNotice("Marca primero tus artistas favoritos.");return;}
    try{await navigator.clipboard.writeText(inviteLink(ids,nickname,includeNickname));setNotice("Enlace de reto copiado. Tu amigo podrá crear su propia agenda y compararla.");}
    catch{setNotice("No se pudo copiar el enlace en este navegador.");}
  }
  function reply(){
    if(!hasInvitation||!selected.length){setNotice("Primero marca a cuáles sets irías para ver tu compatibilidad.");return;}
    const link=pairLink(friendIds,ids);
    window.open("https://wa.me/?text="+encodeURIComponent(messageLink(link,true)),"_blank","noopener,noreferrer");
  }

  return <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 text-white sm:pt-12">
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1b173a] via-[#071620] to-[#101020] px-5 py-8 sm:px-10 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-14 h-72 w-72 rounded-full bg-[#c1ff71]/10 blur-3xl"/>
      <p className="relative flex items-center gap-2 text-xs font-black uppercase tracking-[.22em] text-[#bbff7e]"><Sparkles size={16}/> Creamfields Chile · 14–15 Nov 2026</p>
      <h1 className="relative mt-4 max-w-4xl text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-7xl">TU MÚSICA.<br/><span className="bg-gradient-to-r from-[#c4ff75] via-[#75ffdd] to-[#91a9ff] bg-clip-text text-transparent">TU RUTA.</span><br/>TUS AMIGOS.</h1>
      <p className="relative mt-6 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-lg">Descubre DJs, arma tu agenda, anima tu avatar recorriendo los stages y desafía a tus amigos a encontrar su match.</p>
      <div className="relative mt-6 flex flex-wrap gap-2 text-xs font-medium text-zinc-200">
        <span className="rounded-full border border-white/15 px-3 py-2">86 sets</span><span className="rounded-full border border-white/15 px-3 py-2">6 escenarios por día</span><span className="rounded-full border border-white/15 px-3 py-2">🎮 Ruta animada</span><span className="rounded-full border border-white/15 px-3 py-2">🔒 Sin registro obligatorio</span>
      </div>
    </div>

    {!accepted?<section className="mx-auto mt-8 max-w-3xl rounded-3xl border border-[#c5ff79]/30 bg-white/[.05] p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c8ff90]">1 minuto para empezar</p>
      <h2 className="mt-2 text-2xl font-black">Entra a la beta</h2>
      <p className="mt-3 text-sm leading-7 text-zinc-300">Esta herramienta es independiente, no oficial y experimental. Sus horarios podrían cambiar. Comparar lineups mediante enlace revela los sets seleccionados a quien reciba ese enlace. Puedes usarla sin crear una cuenta.</p>
      <label className="mt-5 flex items-start gap-3 text-sm"><input type="checkbox" checked={agreementChecked} onChange={e=>setAgreementChecked(e.target.checked)} className="mt-1 h-5 w-5 accent-lime-300"/><span><b>Acepto participar en la beta.</b> Entiendo sus características experimentales y el carácter no oficial de los horarios.</span></label>
      <label className="mt-4 flex items-start gap-3 text-sm"><input type="checkbox" checked={privacyMode} onChange={e=>setPrivacyMode(e.target.checked)} className="mt-1 h-5 w-5 accent-lime-300"/><span><b>Modo privado (recomendado).</b> No guardar mi selección, gustos ni aceptación en este navegador. La imagen y la ruta se generan localmente.</span></label>
      <button type="button" disabled={!agreementChecked} onClick={()=>setAccepted(true)} className="mt-6 w-full rounded-xl bg-[#c4ff75] px-5 py-4 font-black text-[#10161c] disabled:cursor-not-allowed disabled:opacity-40">Crear mi lineup gratis <span aria-hidden="true">↗</span></button>
      <p className="mt-3 text-center text-xs text-zinc-500">Sin pago, sin GPS, sin cuenta obligatoria. El hosting puede procesar datos técnicos de acceso.</p>
    </section>:<>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-xs text-zinc-300"><span>🔒 {privacyMode?"Modo privado: sin guardar datos locales":"Guardado exclusivamente en este dispositivo"} · Beta no oficial</span><button type="button" className="font-bold text-[#c1ff80] underline underline-offset-4" onClick={revoke}>Revocar y borrar</button></div>
      <section aria-label="Tu cartera raver" className="sticky top-0 z-40 -mx-4 mt-4 rounded-2xl border border-[#aaff70]/30 bg-[#0b1420]/95 px-3 py-3 shadow-[0_12px_36px_rgba(0,0,0,.3)] backdrop-blur-xl sm:mx-0 sm:px-5">
        <div className="flex items-center justify-between gap-2 sm:gap-5">
          <button type="button" onClick={()=>document.getElementById("my-lineup")?.scrollIntoView({behavior:"smooth",block:"center"})} className="relative flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-left" aria-label={"Abrir mi cartera, "+ids.length+" sets guardados"}>
            <span className="rounded-lg bg-[#c8ff7b]/15 p-2 text-[#c8ff7b]"><ShoppingBag size={20}/></span>
            <span className="hidden text-xs font-extrabold text-white sm:inline">MI CARTERA</span>
            <span aria-live="polite" className="min-w-7 rounded-full bg-[#bfff77] px-2 py-1 text-center text-sm font-black tabular-nums text-[#0d1712]">{ids.length}</span>
            {cartPulse&&<span key={cartPulse.seq} aria-live="polite" className={"pointer-events-none absolute -right-2 -top-5 animate-bounce rounded-full px-2 py-1 text-sm font-black shadow-lg "+(cartPulse.label==="+1"?"bg-[#b4ff79] text-[#0c2417]":"bg-zinc-200 text-zinc-900")}>{cartPulse.label}</span>}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-[11px] sm:text-sm">
              <span className="flex items-center gap-1 font-extrabold text-[#baff7d]"><Heart size={16} fill={heart.completed?"currentColor":"none"}/> RAVER HEART</span>
              <span className="whitespace-nowrap font-black tabular-nums text-white">{percentage}%</span>
            </div>
            <div role="progressbar" aria-label={"Raver Heart "+dayName(day)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-[#82eea2] to-[#c8ff79] transition-all duration-500" style={{width:percentage+"%"}}/></div>
            <p className="mt-1 truncate text-[10px] text-zinc-400 sm:text-xs">{heart.completed?"¡Agenda diaria lista!":heart.validSets+" de "+heart.goal+" sets sin cruces hoy · 100% = meta del día"}</p>
          </div>
          <button type="button" onClick={()=>document.getElementById("animated-route")?.scrollIntoView({behavior:"smooth",block:"start"})} className="hidden rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-[#ccff92] sm:block" disabled={!showAnimation}>Ver escena</button>
        </div>
      </section>
      {hasInvitation&&<section className="mt-6 overflow-hidden rounded-3xl border border-[#c2ff7a]/40 bg-gradient-to-r from-[#122e2a] to-[#17152d] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-wider text-[#c9ff9a]"><Users size={15} className="mr-2 inline"/> Reto recibido</p>
        <h2 className="mt-2 text-2xl font-black">{friendName} te invitó a hacer match</h2>
        <p className="mt-2 text-sm text-zinc-300">Elige tus DJs con “Voy” y descubre cuántos sets comparten. No se crea una cuenta automática.</p>
        <div className="mt-4 flex flex-wrap items-end gap-5"><div><span className="text-5xl font-black text-[#c7ff87]">{match.score}%</span><span className="ml-2 text-sm text-zinc-300">coincidencia de elecciones</span></div><div className="text-sm text-zinc-300">{match.matches.length} sets compartidos de {friendIds.length} elegidos por tu amigo</div></div>
        {!!match.matches.length&&<p className="mt-3 text-sm text-[#d7ffc0]">🎧 {sets.filter(s=>match.matches.includes(s.id)).slice(0,5).map(s=>s.artist).join(" · ")}</p>}
        <button type="button" disabled={!ids.length} onClick={reply} className="mt-4 rounded-xl bg-[#c7ff86] px-5 py-3 font-black text-[#07110c] disabled:opacity-40">Responder por WhatsApp con nuestro match</button>
      </section>}
      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#bcff7b]">01 · Tu identidad musical</p>
          <h2 className="mt-2 text-2xl font-black">¿Qué te mueve?</h2>
          <p className="mt-2 text-sm text-zinc-400">Elige tus estilos. La ruta inteligente prioriza tus decisiones y recomienda otros artistas afines.</p>
          <div className="mt-4 flex flex-wrap gap-2">{STYLE_OPTIONS.map(s=><button key={s.key} type="button" aria-pressed={tastes.includes(s.key)} onClick={()=>toggleTaste(s.key)} className={"rounded-full border px-3 py-2 text-sm transition "+(tastes.includes(s.key)?"border-[#c2ff73] bg-[#c2ff73] font-extrabold text-[#0f1714]":"border-white/15 bg-white/[.03] text-zinc-300 hover:border-white/40")}>#{s.label.replace(/\s+/g,"")}</button>)}</div>
          <p className="mt-3 text-xs text-zinc-500">Las etiquetas son editoriales y aproximadas; artistas sin clasificación aún aparecen en la galería.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#bcff7b]">02 · Tu progreso</p>
          <div className="mt-3 flex items-end gap-3"><span className="text-5xl font-black">{ids.length}</span><span className="pb-2 text-sm text-zinc-400">sets marcados Voy</span></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#c7ff74] to-[#6ee7e5] transition-all" style={{width:percentage+"%"}}/></div><p className="mt-2 text-xs text-[#caff8c]">Raver Heart {percentage}% · {heart.validSets}/{heart.goal} sets compatibles el {dayName(day)}</p>
          <p className="mt-3 text-sm text-zinc-300">{ids.length===0?"Elige tu primera parada 🎧":ids.length<4?"¡Buen inicio! Tu ruta está tomando forma ✨":ids.length<10?"Tu agenda ya tiene identidad 🔥":"¡Listo para compartir y descubrir coincidencias! 🌟"}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm"><span className="rounded-full border border-white/10 px-3 py-2">🤔 Tal vez {maybeIds.length}</span><span className="rounded-full border border-white/10 px-3 py-2">✕ No voy {noIds.length}</span><span className="rounded-full border border-white/10 px-3 py-2">⚡ Sugeridos {myRoute.length}</span></div>
          {knownStyles.length>0&&<p className="mt-4 text-xs text-zinc-400">Tu vibra: {knownStyles.map(s=>s.label).join(" · ")}</p>}
        </div>
      </section>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#c3ff75]">03 · Explora</p><h2 className="mt-1 text-3xl font-black">Los artistas y stages</h2></div><button type="button" onClick={()=>setShowAnimation(v=>!v)} className="inline-flex items-center gap-2 rounded-xl bg-[#c7ff75] px-5 py-3 font-black text-[#07170e]"><PlayCircle size={20}/>{showAnimation?"Ocultar animación":"Animar mi ruta"}</button></div>
      <div className="mt-4 flex flex-wrap gap-2">
        {festival.dates.map(d=><button key={d} type="button" onClick={()=>{setDay(d);setStageFilter("all");}} className={"rounded-xl px-5 py-3 text-sm font-extrabold "+(day===d?"bg-[#c5ff79] text-[#0d1512]":"border border-white/15 text-white")}>{dayName(d)}</button>)}
        <button type="button" onClick={()=>setView("gallery")} className={"inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm "+(view==="gallery"?"bg-white/15":"border border-white/10")}><Music2 size={17}/> Galería</button>
        <button type="button" onClick={()=>setView("stages")} className={"inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm "+(view==="stages"?"bg-white/15":"border border-white/10")}><Map size={17}/> Stages</button>
      </div>
      {showAnimation&&<AnimatedRoute day={day} allSets={sets} attendance={attendance} tastes={tastes}/>}
      <div className="mt-6 flex flex-wrap gap-2">
        <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-white/20 bg-white/[.04] px-4"><Search size={19} className="text-zinc-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="DJ, escenario o estilo..." aria-label="Buscar DJ, escenario o estilo" className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"/></label>
        <button type="button" onClick={()=>setShowAdvanced(v=>!v)} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm"><SlidersHorizontal size={18}/> Filtros</button>
      </div>
      {showAdvanced&&<div className="mt-3 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4">
        <label className="text-xs text-zinc-400">Escenario<select value={stageFilter} onChange={e=>setStageFilter(e.target.value)} className="mt-1 block rounded-lg bg-[#181b2a] p-3 text-sm text-white"><option value="all">Todos</option>{stages.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
        <label className="text-xs text-zinc-400">Género<select value={styleFilter} onChange={e=>setStyleFilter(e.target.value as MusicStyle|"all")} className="mt-1 block rounded-lg bg-[#181b2a] p-3 text-sm text-white"><option value="all">Todos</option>{STYLE_OPTIONS.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></label>
        <label className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={photoConsent} onChange={e=>setPhotoConsent(e.target.checked)} className="accent-lime-300"/> Cargar fotos y logos con licencia abierta desde Wikimedia Commons (conexión externa opcional)</label>
      </div>}

      {view==="stages"&&<div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stages.map(stage=>{
        const meta=STAGE_META[stage],lineup=sets.filter(s=>s.day===day&&s.stage===stage);
        return <button key={stage} type="button" onClick={()=>{setStageFilter(stage);setView("gallery");}} className="rounded-2xl border border-white/10 bg-white/[.04] p-5 text-left transition hover:border-white/30"><span className="mb-3 block h-1 w-16 rounded-full" style={{background:meta.accent}}/><b className="text-xl">{stage}</b><p className="mt-2 text-sm text-zinc-400">{meta.description}</p><p className="mt-4 text-xs text-[#b6ff83]">{lineup.length} sets · Ver lineup ↗</p></button>;
      })}</div>}

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <section>
          <div className="mb-3 flex items-center justify-between"><h3 className="text-xl font-black">Galería · {visible.length} sets</h3><span className="text-xs text-zinc-400">Toca la portada para marcar Voy</span></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((s,index)=>{
              const value=attendance[s.id];const meta=STAGE_META[s.stage];const styles=getStyles(s.artist);
              const photo=photoConsent&&VERIFIED_PHOTOS.has(s.artist)?LICENSED_ARTIST_IMAGES[s.artist]:undefined;
              const logo=photoConsent?OPEN_ARTIST_LOGOS[s.artist]:undefined;
              return <article key={s.id} className={"overflow-hidden rounded-2xl border bg-[#0f1524] transition "+(value==="voy"?"border-[#bbff79] shadow-[0_0_0_1px_rgba(190,255,120,.25)]":"border-white/10")}>
                <button type="button" draggable onDragStart={e=>e.dataTransfer.setData("text/plain",s.id)} onClick={()=>setAttendance(s.id,value==="voy"?undefined:"voy")} className="relative flex aspect-[4/5] w-full flex-col items-start justify-between overflow-hidden p-3 text-left" style={{backgroundImage:photo?"linear-gradient(0deg,rgba(8,10,22,.95),rgba(8,10,22,.1) 65%),url('"+photo.url+"')":ART_PALETTES[index%ART_PALETTES.length],backgroundSize:"cover",backgroundPosition:"center"}}>
                  <span className="relative rounded-full border border-white/25 bg-black/30 px-2 py-1 text-[10px] font-bold">{s.start}–{s.end}</span>
                  {!photo&&<span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-6xl font-black tracking-[-.08em] text-white/10">{initials(s.artist)}</span>}
                  {logo&&<span aria-hidden="true" className="absolute inset-x-3 top-1/3 flex -translate-y-1/2 items-center justify-center rounded-xl bg-white/90 p-3 shadow-lg"><img src={logo.url} alt="" loading="lazy" className="max-h-20 max-w-full object-contain" referrerPolicy="no-referrer"/></span>}
                  <span className="relative mt-auto block"><span className="block text-lg font-black leading-tight sm:text-xl">{s.artist}</span><span className="mt-1 block text-[10px] font-bold tracking-wide" style={{color:meta?.accent??"#fff"}}>{s.stage}</span></span>
                  <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs">{value==="voy"?"💚":value==="talvez"?"🤔":value==="no"?"✕":"＋"}</span>
                </button>
                <div className="flex flex-wrap gap-1 p-2">{styles.length?styles.map(style=><button key={style} type="button" onClick={()=>setStyleFilter(style)} className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-zinc-300">#{style}</button>):<span className="px-1 text-[10px] text-zinc-500">Estilo por verificar</span>}</div>
                <div className="grid grid-cols-3 gap-1 px-2 pb-2">{([["voy","💚 Voy"],["talvez","🤔 Quizá"],["no","✕ No"]] as const).map(([status,text])=><button key={status} type="button" aria-pressed={value===status} onClick={()=>setAttendance(s.id,value===status?undefined:status)} className={"rounded-lg px-1 py-2 text-[11px] font-bold "+(value===status?"bg-[#bfff76] text-[#0a1713]":"bg-white/10 text-zinc-200")}>{text}</button>)}</div>
                <div className="flex flex-wrap justify-between gap-1 border-t border-white/10 px-3 py-2 text-[11px] text-zinc-300"><a href={spotifyArtistSearch(s.artist)} target="_blank" rel="noopener noreferrer" className="hover:text-white">♫ Spotify ↗</a><a href={soundcloudSetSearch(s.artist)} target="_blank" rel="noopener noreferrer" className="hover:text-white">Sets ↗</a><a href={googleCalendarUrl(s)} target="_blank" rel="noopener noreferrer" title="Agregar set a Google Calendar" className="hover:text-white">＋ Agenda ↗</a></div>
                {photo&&<a href={photo.filePage} target="_blank" rel="noopener noreferrer" className="block px-3 pb-2 text-[9px] text-zinc-500">Foto: {photo.credit} · {photo.license} ↗</a>}
                {logo&&<a href={logo.sourcePage} target="_blank" rel="noopener noreferrer" className="block px-3 pb-2 text-[9px] text-zinc-400">Logo: {logo.author} · {logo.license} · Marca del artista ↗</a>}
              </article>;
            })}
          </div>
          {visible.length===0&&<p className="rounded-2xl border border-white/10 p-6 text-zinc-300">Sin resultados. Prueba otro escenario o género.</p>}
        </section>
        <aside id="my-lineup" className="h-fit scroll-mt-28 rounded-3xl border border-white/15 bg-[#121726] p-5 lg:sticky lg:top-4" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData("text/plain");if(sets.some(s=>s.id===id))setAttendance(id,"voy");}}>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#c4ff78]">Tu agenda</p>
          <h3 className="mt-2 text-2xl font-black">Mi lineup <span className="text-[#b6ff77]">({ids.length})</span></h3>
          <p className="mt-1 text-xs text-zinc-500">Selecciona o arrastra las tarjetas para agregarlas.</p>
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">{selected.length?selected.map(s=><div key={s.id} className="flex items-start justify-between gap-2 rounded-xl bg-white/[.05] p-3 text-sm"><span><span className="text-xs text-zinc-400">{dayName(s.day)} · {s.start}–{s.end}</span><b className="mt-1 block">{s.artist}</b><span className="text-xs text-zinc-500">{s.stage}</span></span><button type="button" className="rounded-full p-1 text-[#baff81]" aria-label={"Quitar "+s.artist} onClick={()=>setAttendance(s.id,undefined)}>✕</button></div>):<p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-zinc-400">Tu aventura comienza eligiendo un DJ o un estilo musical.</p>}</div>
          {!!conflicts.length&&<div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/20 p-3"><p className="text-sm font-bold text-amber-200">⚠️ {conflicts.length} conflictos de horario</p>{conflicts.slice(0,3).map((c,index)=><p key={index} className="mt-2 text-xs text-zinc-300">{c.first.artist} ↔ {c.second.artist}</p>)}</div>}
          <div className="mt-4 rounded-xl border border-white/10 p-3"><div className="flex items-center gap-2 text-sm font-bold"><Sparkles size={17} className="text-[#c5ff78]"/> Ruta inteligente</div><p className="mt-2 text-xs leading-5 text-zinc-400">{myRoute.length} sets compatibles este día, priorizando tus gustos y evitando superposiciones. No calcula distancias reales entre stages.</p><button type="button" onClick={()=>{setShowAnimation(true);window.setTimeout(()=>document.getElementById("animated-route")?.scrollIntoView({behavior:"smooth",block:"start"}),50);}} className="mt-3 w-full rounded-lg border border-[#c8ff7d]/40 px-3 py-2 text-sm font-bold text-[#c8ff7d]">▶ Animar mi ruta</button></div>
          <div className="mt-5 flex flex-col gap-2"><button type="button" onClick={share} disabled={!ids.length} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#c6ff73] px-4 py-3 font-black text-[#08120c] disabled:opacity-40"><Share2 size={18}/> Compartir reto por WhatsApp</button><button type="button" onClick={copyLink} disabled={!ids.length} className="rounded-xl border border-white/20 p-3 text-sm disabled:opacity-40">Copiar enlace de invitación</button><button type="button" onClick={()=>downloadIcs(selected)} disabled={!selected.length} className="flex items-center justify-center gap-2 rounded-xl border border-white/20 p-3 text-sm disabled:opacity-40"><CalendarDays size={18}/> Agenda + alerta 15 min (ICS)</button><button type="button" onClick={()=>{if(!selected.length)return;void downloadPoster(selected,includeNickname?nickname:"").then(()=>setNotice("Imagen descargada")).catch(()=>setNotice("No se pudo crear el PNG"));}} disabled={!selected.length} className="rounded-xl border border-white/20 p-3 text-sm disabled:opacity-40">Descargar imagen PNG</button></div>
          <label className="mt-5 block text-xs text-zinc-400">Apodo opcional para invitar<input maxLength={22} value={nickname} onChange={e=>setNickname(safeNickname(e.target.value))} placeholder="Mi alias raver" className="mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-white/[.04] px-3 text-sm text-white outline-none"/></label>
          <label className="mt-3 flex items-start gap-2 text-xs text-zinc-400"><input type="checkbox" checked={includeNickname} onChange={e=>setIncludeNickname(e.target.checked)} className="mt-0.5 accent-lime-300"/> Incluir mi apodo en el enlace y la imagen al compartir.</label>
          <p className="mt-4 text-xs leading-5 text-zinc-500">Cada amigo decide si participa. El enlace solo contiene los sets seleccionados y el apodo si lo autorizas. No se crean cuentas de terceros.</p>
        </aside>
      </div>
      <section className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:grid-cols-3">
        <div><Heart className="text-[#c1ff77]"/><h3 className="mt-2 font-bold">Haz match de lineups</h3><p className="mt-2 text-sm text-zinc-400">Comparte por WhatsApp. Tu amigo selecciona sus DJs y puede devolverte su compatibilidad.</p></div>
        <div><Headphones className="text-[#c1ff77]"/><h3 className="mt-2 font-bold">Conoce música nueva</h3><p className="mt-2 text-sm text-zinc-400">Escucha a cada artista desde Spotify o SoundCloud. Los enlaces buscan música; no reproducimos pistas sin autorización.</p></div>
        <div><ListMusic className="text-[#c1ff77]"/><h3 className="mt-2 font-bold">Llévate tu agenda</h3><p className="mt-2 text-sm text-zinc-400">Exporta tus sets como calendario ICS con recordatorios. Google Calendar permite agregar cada presentación.</p></div>
      </section>
    </>}
    {notice&&<p role="status" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-xl border border-[#baff7e]/40 bg-[#111e23] p-4 text-sm text-[#d5ffbc] shadow-xl">{notice} <button type="button" className="ml-3 underline" onClick={()=>setNotice("")}>Cerrar</button></p>}
    <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500"><span>TrackDJs · Creamfields Chile 2026 · Aplicación independiente no oficial. Confirma los horarios antes del evento.</span><a href="/app" className="font-bold text-[#bdff82]">Explorar TrackDJs global ↗</a></footer>
  </main>;
}
