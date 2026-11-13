"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, CircleHelp, Cloud, Headphones, Heart, ListMusic, Map, Music2, PlayCircle, Search, Share2, ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Users, X } from "lucide-react";
import AnimatedRoute from "@/components/festival/animated-route";
import PremiumFestivalHero from "@/components/festival/premium-festival-hero";
import FestivalEmailSave from "@/components/festival/festival-email-save";
import premiumStyles from "@/components/festival/premium-festival.module.css";
import festival from "@/lib/festival/creamfields-2026.json";
import { getStyles, LICENSED_ARTIST_IMAGES, OPEN_ARTIST_LOGOS, STAGE_META, STYLE_OPTIONS, spotifyArtistSearch, soundcloudSetSearch, type Attendance, type MusicStyle } from "@/lib/festival/music-discovery";
import { calculateMatch, decodeSelection, encodeSelection, getAttendanceConflicts, suggestRoute, type AttendanceMap, type FestivalSet } from "@/lib/festival/route-engine";
import { downloadIcs, googleCalendarUrl } from "@/lib/festival/calendar";
import { raverHeartProgress } from "@/lib/festival/raver-heart";

const sets = festival.sets as FestivalSet[];
const STORAGE_KEY = "trackdjs:creamfields:lineup:v2";
const LEGACY_KEY = "trackdjs:creamfields:lineup:v1";
const SESSION_KEY = "trackdjs:creamfields:session:v1";
const DAY_LABELS: Record<string,string> = {"2026-11-14":"Sáb 14 NOV","2026-11-15":"Dom 15 NOV"};
const VERIFIED_PHOTOS = new Set(["CHARLOTTE DE WITTE","BORIS BREJCHA"]);
const MAX_SHARED = sets.length;
/** Neutral card grounds. Saturated art palettes are replaced by the typographic
 *  mural in P1-2; until then the artist name carries the card, not the background. */
const ART_PALETTES = [
  "radial-gradient(circle at 30% 25%,#232329 0%,#17171A 45%,#0F0F11 100%)",
  "radial-gradient(circle at 70% 20%,#26262C 0%,#19191C 44%,#101012 100%)",
  "radial-gradient(circle at 80% 35%,#212127 0%,#161619 45%,#0E0E10 100%)",
  "radial-gradient(circle at 35% 80%,#25252A 0%,#18181B 50%,#101013 100%)"
];
/** Canvas cannot resolve CSS custom properties, so the poster repeats the tokens. */
const BRAND = { amber: "#E0A355", warm: "#F3F0EA", dim: "#B6B1A8", faint: "#7E7A73" };

function dayName(day:string) {return DAY_LABELS[day]??day;}
function initials(name:string){return name.split(/\s+/).map(word=>word[0]).filter(Boolean).slice(0,3).join("");}
function safeNickname(name:string){return name.trim().replace(/[<>]/g,"").slice(0,22);}
function messageLink(link:string,friend:boolean){return (friend?"Te respondo con mi lineup y nuestro match":"Te reto a armar tu lineup para Creamfields Chile 2026. Compara tus sets con los míos:")+"\n"+link;}
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
  g.addColorStop(0,"#17171A");g.addColorStop(.6,"#121214");g.addColorStop(1,"#0B0B0C");
  ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle=BRAND.amber;ctx.font="bold 36px Arial";ctx.fillText("TRACKDJS  /  FESTIVAL JOURNEY",64,94);
  ctx.fillStyle=BRAND.warm;ctx.font="bold 78px Arial";ctx.fillText("MI CREAMFIELDS",60,196);
  ctx.fillStyle=BRAND.dim;ctx.font="30px Arial";ctx.fillText("14 — 15 NOV 2026 · SANTIAGO",65,256);
  if(nickname){ctx.fillStyle=BRAND.amber;ctx.font="bold 30px Arial";ctx.fillText("@"+nickname,65,312);}
  let y=370;
  for(const day of festival.dates){
    const items=chosen.filter(s=>s.day===day).sort((a,b)=>a.start.localeCompare(b.start));
    if(!items.length)continue;
    ctx.fillStyle=BRAND.amber;ctx.font="bold 34px Arial";ctx.fillText(dayName(day),65,y);y+=58;
    for(const s of items){
      ctx.fillStyle=BRAND.warm;ctx.font="bold 27px Arial";
      const name=s.artist.length>32?s.artist.slice(0,29)+"…":s.artist;
      ctx.fillText(name,65,y);
      ctx.fillStyle=BRAND.dim;ctx.font="23px Arial";ctx.fillText(s.start+" · "+s.stage,575,y,440);y+=48;
    }
    y+=49;
  }
  ctx.fillStyle=BRAND.amber;ctx.font="bold 30px Arial";ctx.fillText("ARMA TU RUTA EN TRACKDJS.COM",65,c.height-84);
  ctx.fillStyle=BRAND.faint;ctx.font="20px Arial";ctx.fillText("App independiente · Horarios referenciales · No oficial",65,c.height-40);
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
  const [saveOpen,setSaveOpen]=useState(false);
  const [resumePending,setResumePending]=useState(false);
  useEffect(()=>{
    if(!cartPulse)return;
    const timer=window.setTimeout(()=>setCartPulse(null),950);
    return()=>window.clearTimeout(timer);
  },[cartPulse]);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const resume=params.get("resume")?.split(".");
    const friendParam=params.get("invite");
    const compare=params.get("compare")?.split(".");
    if(resume?.length===3){
      setIds(decodeSelection(resume[0],sets));
      setMaybeIds(decodeSelection(resume[1],sets));
      setNoIds(decodeSelection(resume[2],sets));
      setResumePending(true);
    }else if(friendParam){
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
    if(!resume?.length&&!friendParam&&!compare?.length&&!params.has("lineup")){
      try {
        const raw=sessionStorage.getItem(SESSION_KEY)??localStorage.getItem(STORAGE_KEY)??localStorage.getItem(LEGACY_KEY);
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
    // Permanent cloud saving requires email. Optional same-tab continuity
    // uses sessionStorage only, never the backend.
    try{
      localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_KEY);
      if(!accepted||privacyMode)sessionStorage.removeItem(SESSION_KEY);
      else sessionStorage.setItem(SESSION_KEY,JSON.stringify({accepted:true,privacyMode:false,ids,maybeIds,noIds,tastes,nickname,includeNickname}));
    }catch{}
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
    setAccepted(false);setAgreementChecked(false);setPrivacyMode(true);setSaveOpen(false);setCartPulse(null);setIds([]);setMaybeIds([]);setNoIds([]);setTastes([]);setNickname("");setIncludeNickname(false);
    try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_KEY);sessionStorage.removeItem(SESSION_KEY);}catch{}
    setNotice("Selección reiniciada en esta pestaña. Para borrar datos en la nube, contacta con privacidad.");
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
    <PremiumFestivalHero day={day} stages={stages} selectedStage={stageFilter==="all"?stages[0]:stageFilter}
      selectedCount={ids.length} coverage={percentage}
      onDayChange={next=>{setDay(next);setStageFilter("all");}}
      onStageChange={stage=>{setStageFilter(stage);setView("gallery");}}
      onOpenArtists={()=>{document.getElementById(accepted?"artist-gallery":"beta-agreement")?.scrollIntoView({behavior:"smooth",block:"start"});}}
      onSave={()=>{if(!accepted){document.getElementById("beta-agreement")?.scrollIntoView({behavior:"smooth",block:"center"});setNotice("Acepta las condiciones beta antes de guardar.");}else setSaveOpen(true);}}
    />

    {!accepted?<section id="beta-agreement" className="mx-auto mt-8 scroll-mt-24 max-w-3xl rounded-3xl border border-amber/30 bg-white/[.05] p-5 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-warm-faint">1 minuto para empezar</p>
      <h2 className="font-display mt-2 text-2xl font-semibold">Entra a la beta</h2>
      <p className="mt-3 text-sm leading-7 text-warm-dim">Esta herramienta es independiente, no oficial y experimental. Sus horarios podrían cambiar. Comparar lineups mediante enlace revela los sets seleccionados a quien reciba ese enlace. Puedes usarla sin crear una cuenta.</p>
      <label className="mt-5 flex items-start gap-3 text-sm"><input type="checkbox" checked={agreementChecked} onChange={e=>setAgreementChecked(e.target.checked)} className="mt-1 h-5 w-5 accent-lime-300"/><span><b>Acepto participar en la beta.</b> Entiendo sus características experimentales y el carácter no oficial de los horarios.</span></label>
      <label className="mt-4 flex items-start gap-3 text-sm"><input type="checkbox" checked={privacyMode} onChange={e=>setPrivacyMode(e.target.checked)} className="mt-1 h-5 w-5 accent-lime-300"/><span><b>Modo privado (recomendado).</b> No conservar mis datos al cerrar o recargar esta pestaña. Si lo desactivo, la selección se recuerda solo en esta pestaña. Guardar permanentemente requiere correo y consentimiento.</span></label>
      <button type="button" disabled={!agreementChecked} onClick={()=>setAccepted(true)} className="mt-6 min-h-12 w-full rounded-control px-5 py-4 font-semibold bg-warm text-on-action disabled:bg-raised disabled:text-warm-faint disabled:cursor-not-allowed">Crear mi lineup gratis <span aria-hidden="true">↗</span></button>
      <p className="mt-3 text-center text-xs text-warm-faint">Sin pago, sin GPS, sin cuenta obligatoria. El hosting puede procesar datos técnicos de acceso.</p>
    </section>:<>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-xs text-warm-dim"><span className="flex items-center gap-2"><ShieldCheck size={16} /> {privacyMode?"Sesión privada sin almacenamiento":"Continuidad solo en esta pestaña"} · Beta no oficial</span><button type="button" className="font-semibold text-warm-dim underline underline-offset-4" onClick={revoke}>Reiniciar esta sesión</button></div>
      {resumePending&&<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber/35 bg-amber/10 p-4 text-sm"><span>Tu selección volvió desde el enlace del correo. Confirma el guardado en tu cuenta.</span><button type="button" onClick={()=>setSaveOpen(true)} className="min-h-11 rounded-control px-4 py-2 font-semibold bg-warm text-on-action disabled:bg-raised disabled:text-warm-faint">Guardar ahora</button></div>}
      <section aria-label="Tu cartera raver" className="sticky top-0 z-40 -mx-4 mt-4 rounded-2xl border border-amber/30 bg-surface/95 px-3 py-3 shadow-[0_12px_36px_rgba(0,0,0,.3)] backdrop-blur-xl sm:mx-0 sm:px-5">
        <div className="flex items-center justify-between gap-2 sm:gap-5">
          <button type="button" onClick={()=>document.getElementById("my-lineup")?.scrollIntoView({behavior:"smooth",block:"center"})} className="relative flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-left" aria-label={"Abrir mi cartera, "+ids.length+" sets guardados"}>
            <span className="rounded-lg bg-amber/15 p-2 text-amber"><ShoppingBag size={20}/></span>
            <span className="hidden text-xs font-semibold text-white sm:inline">MI CARTERA</span>
            <span aria-live="polite" className="min-w-7 rounded-full bg-amber px-2 py-1 text-center text-sm font-semibold tabular-nums text-amber-ink">{ids.length}</span>
            {cartPulse&&<span key={cartPulse.seq} aria-live="polite" className={"pointer-events-none absolute -right-2 -top-5 animate-bounce rounded-full px-2 py-1 text-sm font-semibold shadow-lg "+(cartPulse.label==="+1"?"bg-amber text-amber-ink":"bg-warm-dim text-on-action")}>{cartPulse.label}</span>}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-[11px] sm:text-sm">
              <span className="flex items-center gap-1 font-semibold text-amber"><Heart size={16} fill={heart.completed?"currentColor":"none"}/> RAVER HEART</span>
              <span className="whitespace-nowrap font-semibold tabular-nums text-white">{percentage}%</span>
            </div>
            <div role="progressbar" aria-label={"Cobertura planificada "+dayName(day)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="relative mt-2 h-3 overflow-hidden rounded-full bg-white/15">
                {heart.segments.map((seg,i)=><span key={i} className="absolute inset-y-0 rounded-full bg-gradient-to-r from-amber to-amber transition-all duration-300" style={{left:((seg.start-heart.start)/Math.max(1,heart.totalMinutes)*100)+"%",width:((seg.end-seg.start)/Math.max(1,heart.totalMinutes)*100)+"%"}}/>)}
              </div>
            <p className="mt-1 truncate text-[10px] text-warm-dim sm:text-xs">{heart.completed?"¡Cobertura completa de apertura a cierre!":heart.coveredMinutes+" de "+heart.totalMinutes+" min del "+dayName(day)+" · "+heart.startLabel+"–"+heart.endLabel}</p>
          </div>
          <button type="button" onClick={()=>document.getElementById("animated-route")?.scrollIntoView({behavior:"smooth",block:"start"})} className="hidden rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-warm-dim sm:block" disabled={!showAnimation}>Ver escena</button>
        </div>
      </section>
      {hasInvitation&&<section className="mt-6 overflow-hidden rounded-3xl border border-amber/40 bg-surface p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-warm-faint"><Users size={15} className="mr-2 inline"/> Reto recibido</p>
        <h2 className="font-display mt-2 text-2xl font-semibold">{friendName} te invitó a hacer match</h2>
        <p className="mt-2 text-sm text-warm-dim">Elige tus DJs con “Voy” y descubre cuántos sets comparten. No se crea una cuenta automática.</p>
        <div className="mt-4 flex flex-wrap items-end gap-5"><div><span className="text-5xl font-semibold text-amber">{match.score}%</span><span className="ml-2 text-sm text-warm-dim">coincidencia de elecciones</span></div><div className="text-sm text-warm-dim">{match.matches.length} sets compartidos de {friendIds.length} elegidos por tu amigo</div></div>
        {!!match.matches.length&&<p className="mt-3 text-sm text-amber">{sets.filter(s=>match.matches.includes(s.id)).slice(0,5).map(s=>s.artist).join(" · ")}</p>}
        <button type="button" disabled={!ids.length} onClick={reply} className="mt-4 min-h-12 rounded-control px-5 py-3 font-semibold bg-warm text-on-action disabled:bg-raised disabled:text-warm-faint">Responder por WhatsApp con nuestro match</button>
      </section>}
      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-warm-faint">01 · Tu identidad musical</p>
          <h2 className="font-display mt-2 text-2xl font-semibold">¿Qué te mueve?</h2>
          <p className="mt-2 text-sm text-warm-dim">Elige tus estilos. La ruta inteligente prioriza tus decisiones y recomienda otros artistas afines.</p>
          <div className="mt-4 flex flex-wrap gap-2">{STYLE_OPTIONS.map(s=><button key={s.key} type="button" aria-pressed={tastes.includes(s.key)} onClick={()=>toggleTaste(s.key)} className={"rounded-full border px-3 py-2 text-sm transition "+(tastes.includes(s.key)?"border-warm bg-warm/10 font-semibold text-warm":"border-white/15 bg-white/[.03] text-warm-dim hover:border-white/40")}>#{s.label.replace(/\s+/g,"")}</button>)}</div>
          <p className="mt-3 text-xs text-warm-faint">Las etiquetas son editoriales y aproximadas; artistas sin clasificación aún aparecen en la galería.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-warm-faint">02 · Tu progreso</p>
          <div className="mt-3 flex items-end gap-3"><span className="text-5xl font-semibold">{ids.length}</span><span className="pb-2 text-sm text-warm-dim">sets marcados Voy</span></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber to-amber transition-all" style={{width:percentage+"%"}}/></div><p className="mt-2 text-xs text-amber">Raver Heart {percentage}% · {heart.coveredMinutes}/{heart.totalMinutes} min cubiertos · {heart.startLabel}–{heart.endLabel}</p>
          <p className="mt-2 text-xs text-warm-dim">Los huecos y los conflictos no suman minutos. Raver Heart llega al 100% únicamente con cobertura continua desde apertura hasta cierre.</p><p className="mt-3 text-sm text-warm-dim">{ids.length===0?"Elige tu primera parada.":ids.length<4?"Tu ruta está tomando forma.":ids.length<10?"Tu agenda ya tiene identidad.":"Listo para compartir y descubrir coincidencias."}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm"><span className="rounded-full border border-white/10 px-3 py-2">Tal vez {maybeIds.length}</span><span className="rounded-full border border-white/10 px-3 py-2">No voy {noIds.length}</span><span className="rounded-full border border-white/10 px-3 py-2">Sugeridos {myRoute.length}</span></div>
          {knownStyles.length>0&&<p className="mt-4 text-xs text-warm-dim">Tu vibra: {knownStyles.map(s=>s.label).join(" · ")}</p>}
        </div>
      </section>

      <div id="artist-gallery" className="mt-9 scroll-mt-24 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-warm-faint">03 · Explora</p><h2 className="font-display mt-1 text-3xl font-semibold">Los artistas y stages</h2></div><button type="button" onClick={()=>setShowAnimation(v=>!v)} className="inline-flex min-h-12 items-center gap-2 rounded-control px-5 py-3 font-semibold bg-warm text-on-action disabled:bg-raised disabled:text-warm-faint"><PlayCircle size={20}/>{showAnimation?"Ocultar animación":"Animar mi ruta"}</button></div>
      <div className="mt-4 flex flex-wrap gap-2">
        {festival.dates.map(d=><button key={d} type="button" onClick={()=>{setDay(d);setStageFilter("all");}} className={"rounded-xl px-5 py-3 text-sm font-semibold "+(day===d?"border border-warm bg-warm/10 text-warm":"border border-white/15 text-warm-dim")}>{dayName(d)}</button>)}
        <button type="button" onClick={()=>setView("gallery")} className={"inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm "+(view==="gallery"?"bg-white/15":"border border-white/10")}><Music2 size={17}/> Galería</button>
        <button type="button" onClick={()=>setView("stages")} className={"inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm "+(view==="stages"?"bg-white/15":"border border-white/10")}><Map size={17}/> Stages</button>
      </div>
      {showAnimation&&<AnimatedRoute day={day} allSets={sets} attendance={attendance} tastes={tastes}/>}
      <div className="mt-6 flex flex-wrap gap-2">
        <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-white/20 bg-white/[.04] px-4"><Search size={19} className="text-warm-dim"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="DJ, escenario o estilo..." aria-label="Buscar DJ, escenario o estilo" className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-warm-faint"/></label>
        <button type="button" onClick={()=>setShowAdvanced(v=>!v)} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm"><SlidersHorizontal size={18}/> Filtros</button>
      </div>
      {showAdvanced&&<div className="mt-3 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4">
        <label className="text-xs text-warm-dim">Escenario<select value={stageFilter} onChange={e=>setStageFilter(e.target.value)} className="mt-1 block rounded-lg bg-raised p-3 text-sm text-white"><option value="all">Todos</option>{stages.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
        <label className="text-xs text-warm-dim">Género<select value={styleFilter} onChange={e=>setStyleFilter(e.target.value as MusicStyle|"all")} className="mt-1 block rounded-lg bg-raised p-3 text-sm text-white"><option value="all">Todos</option>{STYLE_OPTIONS.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></label>
        <label className="flex items-center gap-2 text-xs text-warm-dim"><input type="checkbox" checked={photoConsent} onChange={e=>setPhotoConsent(e.target.checked)} className="accent-lime-300"/> Cargar fotos y logos con licencia abierta desde Wikimedia Commons (conexión externa opcional)</label>
      </div>}

      {view==="stages"&&<div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stages.map(stage=>{
        const meta=STAGE_META[stage],lineup=sets.filter(s=>s.day===day&&s.stage===stage);
        return <button key={stage} type="button" onClick={()=>{setStageFilter(stage);setView("gallery");}} className="rounded-2xl border border-white/10 bg-white/[.04] p-5 text-left transition hover:border-white/30"><span className="mb-3 block h-1 w-16 rounded-full" style={{background:meta.accent}}/><b className="text-xl">{stage}</b><p className="mt-2 text-sm text-warm-dim">{meta.description}</p><p className="mt-4 text-xs text-warm-dim">{lineup.length} sets · Ver lineup ↗</p></button>;
      })}</div>}

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-xl font-semibold">Galería · {visible.length} sets</h3>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-3 py-2 text-xs text-warm-dim">
              <input type="checkbox" checked={photoConsent} onChange={e=>setPhotoConsent(e.target.checked)} className="accent-lime-300"/>
              Mostrar fotos y logos abiertos
            </label>
          </div>
          <p className="mb-3 text-xs text-warm-faint">Toca la portada para marcar Voy. Las imágenes de Wikimedia Commons solo se cargan si lo eliges; la licencia y el origen se muestran en cada ficha.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((s,index)=>{
              const value=attendance[s.id];const meta=STAGE_META[s.stage];const styles=getStyles(s.artist);
              const photo=photoConsent&&VERIFIED_PHOTOS.has(s.artist)?LICENSED_ARTIST_IMAGES[s.artist]:undefined;
              const logo=photoConsent?OPEN_ARTIST_LOGOS[s.artist]:undefined;
              return <article key={s.id} className={"overflow-hidden rounded-2xl border bg-surface transition "+(value==="voy"?"border-amber shadow-[0_0_0_1px_rgba(190,255,120,.25)]":"border-white/10")}>
                <button type="button" draggable onDragStart={e=>e.dataTransfer.setData("text/plain",s.id)} onClick={()=>setAttendance(s.id,value==="voy"?undefined:"voy")} className="relative flex aspect-[4/5] w-full flex-col items-start justify-between overflow-hidden p-3 text-left" style={{backgroundImage:photo?"linear-gradient(0deg,rgba(8,10,22,.95),rgba(8,10,22,.1) 65%),url('"+photo.url+"')":ART_PALETTES[index%ART_PALETTES.length],backgroundSize:"cover",backgroundPosition:"center"}}>
                  <span className={premiumStyles.thumbnail} data-tone={styles[0]??"edm"} aria-hidden="true"/>
                  <span className="relative rounded-full border border-white/25 bg-black/30 px-2 py-1 text-[10px] font-semibold">{s.start}–{s.end}</span>
                  {!photo&&<span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-6xl font-semibold tracking-[-.08em] text-white/10">{initials(s.artist)}</span>}
                  {logo&&<span aria-hidden="true" className="absolute inset-x-3 top-1/3 flex -translate-y-1/2 items-center justify-center rounded-xl bg-white/90 p-3 shadow-lg"><img src={logo.url} alt="" loading="lazy" className="max-h-20 max-w-full object-contain" referrerPolicy="no-referrer"/></span>}
                  <span className="relative mt-auto block"><span className="block text-lg font-semibold leading-tight sm:text-xl">{s.artist}</span><span className="mt-1 block text-[10px] font-semibold tracking-wide" style={{color:meta?.accent??"#fff"}}>{s.stage}</span></span>
                  <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/65 text-white">{value==="voy"?<Check size={17} strokeWidth={3}/>:value==="talvez"?<CircleHelp size={17}/>:value==="no"?<X size={17}/>:<span className="text-xl font-light">+</span>}</span>
                </button>
                <div className="flex flex-wrap gap-1 p-2">{styles.length?styles.map(style=><button key={style} type="button" onClick={()=>setStyleFilter(style)} className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-warm-dim">#{style}</button>):<span className="px-1 text-[10px] text-warm-faint">Estilo por verificar</span>}</div>
                <div className="grid grid-cols-3 gap-1 px-2 pb-2">{([["voy","Voy"],["talvez","Quizá"],["no","No"]] as const).map(([status,text])=><button key={status} type="button" aria-pressed={value===status} onClick={()=>setAttendance(s.id,value===status?undefined:status)} className={"flex items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold "+(value===status?(status==="voy"?"bg-amber text-amber-ink":"bg-warm/15 text-warm"):"bg-white/10 text-warm-dim")}>{status==="voy"?<Check size={12}/>:status==="talvez"?<CircleHelp size={12}/>:<X size={12}/>} {text}</button>)}</div>
                <div className="flex flex-wrap justify-between gap-1 border-t border-white/10 px-3 py-2 text-[11px] text-warm-dim"><a href={spotifyArtistSearch(s.artist)} target="_blank" rel="noopener noreferrer" className="hover:text-white">Spotify ↗</a><a href={soundcloudSetSearch(s.artist)} target="_blank" rel="noopener noreferrer" className="hover:text-white">Sets ↗</a><a href={googleCalendarUrl(s)} target="_blank" rel="noopener noreferrer" title="Agregar set a Google Calendar" className="hover:text-white">＋ Agenda ↗</a></div>
                {photo&&<a href={photo.filePage} target="_blank" rel="noopener noreferrer" className="block px-3 pb-2 text-[9px] text-warm-faint">Foto: {photo.credit} · {photo.license} ↗</a>}
                {logo&&<a href={logo.sourcePage} target="_blank" rel="noopener noreferrer" className="block px-3 pb-2 text-[9px] text-warm-dim">Logo: {logo.author} · {logo.license} · Marca del artista ↗</a>}
              </article>;
            })}
          </div>
          {visible.length===0&&<p className="rounded-2xl border border-white/10 p-6 text-warm-dim">Sin resultados. Prueba otro escenario o género.</p>}
        </section>
        <aside id="my-lineup" className="h-fit scroll-mt-28 rounded-3xl border border-white/15 bg-surface p-5 lg:sticky lg:top-4" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData("text/plain");if(sets.some(s=>s.id===id))setAttendance(id,"voy");}}>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-warm-faint">Tu agenda</p>
          <h3 className="font-display mt-2 text-2xl font-semibold">Mi lineup <span className="text-amber">({ids.length})</span></h3>
          <p className="mt-1 text-xs text-warm-faint">Selecciona o arrastra las tarjetas para agregarlas.</p>
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">{selected.length?selected.map(s=><div key={s.id} className="flex items-start justify-between gap-2 rounded-xl bg-white/[.05] p-3 text-sm"><span><span className="text-xs text-warm-dim">{dayName(s.day)} · {s.start}–{s.end}</span><b className="mt-1 block">{s.artist}</b><span className="text-xs text-warm-faint">{s.stage}</span></span><button type="button" className="rounded-full p-1 text-amber" aria-label={"Quitar "+s.artist} onClick={()=>setAttendance(s.id,undefined)}>✕</button></div>):<p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-warm-dim">Tu aventura comienza eligiendo un DJ o un estilo musical.</p>}</div>
          {!!conflicts.length&&<div className="mt-4 rounded-xl border border-alert/40 bg-alert/10 p-3"><p className="text-sm font-semibold text-alert">{conflicts.length} conflictos de horario</p>{conflicts.slice(0,3).map((c,index)=><p key={index} className="mt-2 text-xs text-warm-dim">{c.first.artist} ↔ {c.second.artist}</p>)}</div>}
          <div className="mt-4 rounded-xl border border-white/10 p-3"><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={17} className="text-amber"/> Ruta inteligente</div><p className="mt-2 text-xs leading-5 text-warm-dim">{myRoute.length} sets compatibles este día, priorizando tus gustos y evitando superposiciones. No calcula distancias reales entre stages.</p><button type="button" onClick={()=>{setShowAnimation(true);window.setTimeout(()=>document.getElementById("animated-route")?.scrollIntoView({behavior:"smooth",block:"start"}),50);}} className="mt-3 w-full rounded-lg border border-amber/40 px-3 py-2 text-sm font-semibold text-amber">Animar mi ruta</button></div>
          <div className="mt-5 flex flex-col gap-2"><button type="button" onClick={()=>setSaveOpen(true)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber/45 bg-amber/10 px-4 py-3 font-semibold text-amber"><Cloud size={18}/> Guardar en mi cuenta · solo correo</button><button type="button" onClick={share} disabled={!ids.length} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber px-4 py-3 font-semibold text-amber-ink disabled:opacity-40"><Share2 size={18}/> Compartir reto por WhatsApp</button><button type="button" onClick={copyLink} disabled={!ids.length} className="rounded-xl border border-white/20 p-3 text-sm disabled:opacity-40">Copiar enlace de invitación</button><button type="button" onClick={()=>downloadIcs(selected)} disabled={!selected.length} className="flex items-center justify-center gap-2 rounded-xl border border-white/20 p-3 text-sm disabled:opacity-40"><CalendarDays size={18}/> Agenda + alerta 15 min (ICS)</button><button type="button" onClick={()=>{if(!selected.length)return;void downloadPoster(selected,includeNickname?nickname:"").then(()=>setNotice("Imagen descargada")).catch(()=>setNotice("No se pudo crear el PNG"));}} disabled={!selected.length} className="rounded-xl border border-white/20 p-3 text-sm disabled:opacity-40">Descargar imagen PNG</button></div>
          <label className="mt-5 block text-xs text-warm-dim">Apodo opcional para invitar<input maxLength={22} value={nickname} onChange={e=>setNickname(safeNickname(e.target.value))} placeholder="Mi alias raver" className="mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-white/[.04] px-3 text-sm text-white outline-none"/></label>
          <label className="mt-3 flex items-start gap-2 text-xs text-warm-dim"><input type="checkbox" checked={includeNickname} onChange={e=>setIncludeNickname(e.target.checked)} className="mt-0.5 accent-lime-300"/> Incluir mi apodo en el enlace y la imagen al compartir.</label>
          <p className="mt-4 text-xs leading-5 text-warm-faint">Cada amigo decide si participa. El enlace solo contiene los sets seleccionados y el apodo si lo autorizas. No se crean cuentas de terceros.</p>
        </aside>
      </div>
      <section className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:grid-cols-3">
        <div><Heart className="text-amber"/><h3 className="font-display mt-2 font-semibold">Haz match de lineups</h3><p className="mt-2 text-sm text-warm-dim">Comparte por WhatsApp. Tu amigo selecciona sus DJs y puede devolverte su compatibilidad.</p></div>
        <div><Headphones className="text-amber"/><h3 className="font-display mt-2 font-semibold">Conoce música nueva</h3><p className="mt-2 text-sm text-warm-dim">Escucha a cada artista desde Spotify o SoundCloud. Los enlaces buscan música; no reproducimos pistas sin autorización.</p></div>
        <div><ListMusic className="text-amber"/><h3 className="font-display mt-2 font-semibold">Llévate tu agenda</h3><p className="mt-2 text-sm text-warm-dim">Exporta tus sets como calendario ICS con recordatorios. Google Calendar permite agregar cada presentación.</p></div>
      </section>
    </>}
    {saveOpen&&accepted&&<FestivalEmailSave selected_ids={ids} maybe_ids={maybeIds} no_ids={noIds} favorite_styles={tastes} onClose={()=>setSaveOpen(false)} onRestore={data=>{setIds(data.selected_ids);setMaybeIds(data.maybe_ids);setNoIds(data.no_ids);setTastes(data.favorite_styles.filter(t=>STYLE_OPTIONS.some(s=>s.key===t)) as MusicStyle[]);setResumePending(false);}}/>}
    {notice&&<p role="status" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-xl border border-amber/40 bg-surface p-4 text-sm text-amber shadow-xl">{notice} <button type="button" className="ml-3 underline" onClick={()=>setNotice("")}>Cerrar</button></p>}
    <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-warm-faint"><span>TrackDJs · Creamfields Chile 2026 · Aplicación independiente no oficial. Confirma los horarios antes del evento.</span><a href="/app" className="font-semibold text-warm-dim underline underline-offset-4">Explorar TrackDJs global ↗</a></footer>
  </main>;
}
