"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { STAGE_META, type Attendance, type MusicStyle } from "@/lib/festival/music-discovery";
import { type AttendanceMap, type FestivalSet, type RouteStep, suggestRoute, toMinutes, formatClock, getTightStageChanges } from "@/lib/festival/route-engine";

type Props = {
  day: string;
  allSets: FestivalSet[];
  attendance: AttendanceMap;
  tastes: MusicStyle[];
};
type AvatarStyle = "neon" | "violet" | "sunset";
type Accessory = "headphones" | "cap" | "glasses";
const SIZE = {width: 1100, height: 660};
const PAL: Record<AvatarStyle, {body:string; glow:string}> = {
  neon: {body:"#a6ff69",glow:"#7ffeac"},
  violet: {body:"#ad8dff",glow:"#ae91ff"},
  sunset: {body:"#ff9d83",glow:"#ffb976"}
};
const DAY_START = 13*60, DAY_END = 23*60;
const CLOCK_RANGE = DAY_END - DAY_START;

function rounded(ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number, color:string) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill();
}
function label(ctx:CanvasRenderingContext2D, str:string, x:number, y:number, size:number, color:string, weight=600, maxWidth?:number) {
  ctx.fillStyle=color; ctx.font=weight+" "+size+"px system-ui,Arial,sans-serif";
  if(maxWidth) ctx.fillText(str,x,y,maxWidth); else ctx.fillText(str,x,y);
}
function stageXY(index:number) {
  return {x: 196 + (index%3)*355, y: 230 + Math.floor(index/3)*235};
}
function paintAvatar(ctx:CanvasRenderingContext2D,x:number,y:number,phase:number,style:AvatarStyle,accessory:Accessory,walking:boolean) {
  const skin="#ffcfaa", look=PAL[style];
  const bob = walking ? Math.sin(phase*25)*4 : Math.sin(phase*7)*2;
  ctx.save();ctx.translate(x,y+bob);
  ctx.shadowColor=look.glow;ctx.shadowBlur=34;
  ctx.fillStyle=look.glow;ctx.beginPath();ctx.ellipse(0,24,24,9,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle="#f0f4ff";ctx.lineWidth=8;ctx.lineCap="round";
  const feet=walking?Math.sin(phase*28)*9:0;
  ctx.beginPath();ctx.moveTo(-8,-2);ctx.lineTo(-11+feet,17);ctx.moveTo(8,-2);ctx.lineTo(11-feet,17);ctx.stroke();
  rounded(ctx,-20,-54,40,48,15,look.body);
  ctx.strokeStyle=look.body;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-17,-43);ctx.lineTo(-29,-21+feet/2);ctx.moveTo(17,-43);ctx.lineTo(29,-21-feet/2);ctx.stroke();
  ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-75,23,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#242137";ctx.beginPath();ctx.arc(0,-84,21,Math.PI,Math.PI*2);ctx.fill();
  if(accessory==="glasses"){rounded(ctx,-19,-78,38,12,4,"#0e1023");ctx.fillStyle="#59ffee";ctx.fillRect(-9,-73,18,2);}
  if(accessory==="cap"){rounded(ctx,-24,-94,48,15,7,"#181a2a");rounded(ctx,-4,-82,30,5,3,"#181a2a");}
  if(accessory==="headphones"){ctx.strokeStyle="#101927";ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,-76,26,Math.PI*1.12,Math.PI*1.88);ctx.stroke();rounded(ctx,-28,-81,10,20,4,"#101927");rounded(ctx,18,-81,10,20,4,"#101927");}
  ctx.restore();
}
function getAvatarLocation(route:RouteStep[], minute:number, positions:Record<string,{x:number;y:number}>) {
  const entrance={x:145,y:520};
  if(route.length===0) return {...entrance,moving:false};
  const first=route[0];
  if(minute<toMinutes(first.start)){
    const amount=Math.min(1,Math.max(0,(minute-DAY_START)/Math.max(10,toMinutes(first.start)-DAY_START)));
    const dest=positions[first.stage];
    return {x:entrance.x+(dest.x-entrance.x)*amount,y:entrance.y+(dest.y-entrance.y)*amount,moving:amount>0&&amount<1};
  }
  let latest=first;
  for(let i=0;i<route.length;i++){
    const s=route[i];
    if(minute>=toMinutes(s.start)) latest=s;
    else{
      const from=positions[latest.stage], to=positions[s.stage];
      const after=toMinutes(latest.end), before=toMinutes(s.start);
      const t=Math.max(0,Math.min(1,(minute-after)/Math.max(1,before-after)));
      const ease=t*t*(3-2*t);
      return {x:from.x+(to.x-from.x)*ease,y:from.y+(to.y-from.y)*ease,moving:t>0&&t<1&&latest.stage!==s.stage};
    }
  }
  const destination=positions[latest.stage];
  return {...destination,moving:false};
}
function drawScene(
  canvas:HTMLCanvasElement, allSets:FestivalSet[], route:RouteStep[], day:string,
  progress:number, style:AvatarStyle, accessory:Accessory
){
  const ctx=canvas.getContext("2d");if(!ctx)return;
  const W=SIZE.width,H=SIZE.height;
  if(canvas.width!==W) canvas.width=W;if(canvas.height!==H)canvas.height=H;
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,"#080b1b");bg.addColorStop(.55,"#13132e");bg.addColorStop(1,"#080e17");
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  for(let i=0;i<65;i++){const x=(i*173+37)%W,y=(i*97+22)%H;ctx.fillStyle="rgba(180,234,254,.15)";ctx.fillRect(x,y,2,2);}
  const mins=DAY_START+Math.round(progress*CLOCK_RANGE);
  rounded(ctx,28,26,1044,92,20,"rgba(255,255,255,.05)");
  label(ctx,"TRACKDJS  /  CREAMFIELDS JOURNEY",54,59,17,"#abff70",800);
  label(ctx,day==="2026-11-14"?"SÁB 14 NOV":"DOM 15 NOV",54,89,18,"#ffffff",700);
  rounded(ctx,888,43,164,57,15,"#bcff6a");
  label(ctx,formatClock(mins),903,83,35,"#09120b",900);
  const stages=Array.from(new Set(allSets.filter(s=>s.day===day).map(s=>s.stage)));
  const positions:Record<string,{x:number;y:number}>={};
  stages.forEach((s,i)=>{positions[s]=stageXY(i);});
  ctx.strokeStyle="rgba(179,239,255,.10)";ctx.lineWidth=3;ctx.setLineDash([5,11]);
  ctx.beginPath();ctx.moveTo(145,520);
  route.forEach((s)=>{const p=positions[s.stage];ctx.lineTo(p.x,p.y);});
  ctx.stroke();ctx.setLineDash([]);
  stages.forEach((stage,index)=>{
    const p=positions[stage],meta=STAGE_META[stage];
    const playing=allSets.find(s=>s.day===day&&s.stage===stage&&toMinutes(s.start)<=mins&&mins<toMinutes(s.end));
    const picked=route.some(s=>s.stage===stage&&toMinutes(s.start)<=mins&&mins<toMinutes(s.end));
    const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,104);
    glow.addColorStop(0,(meta?.accent??"#a5ffd0")+"40");glow.addColorStop(1,"transparent");
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,104,0,2*Math.PI);ctx.fill();
    ctx.strokeStyle=picked?"#c7ff72":(meta?.accent??"#9df4dd");ctx.lineWidth=picked?5:2;
    ctx.beginPath();ctx.arc(p.x,p.y,47+(picked?Math.sin(progress*140)*2:0),0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#0f1725";ctx.beginPath();ctx.arc(p.x,p.y,43,0,Math.PI*2);ctx.fill();
    label(ctx,String(index+1).padStart(2,"0"),p.x-19,p.y+13,32,meta?.accent??"#d7fff9",900);
    ctx.textAlign="center";
    label(ctx,meta?.label??stage,p.x,p.y-65,19,"#eef6ff",800,310);
    rounded(ctx,p.x-147,p.y+61,294,39,12,"rgba(11,22,38,.92)");
    const artist=playing?playing.artist:"SIN SET EN ESTE MOMENTO";
    label(ctx,artist,p.x,p.y+87,17,playing?"#ffffff":"#8190a8",700,278);
    ctx.textAlign="left";
  });
  const position=getAvatarLocation(route,mins,positions);
  paintAvatar(ctx,position.x,position.y,progress*20,style,accessory,position.moving);
  const now=route.find(s=>toMinutes(s.start)<=mins&&mins<toMinutes(s.end));
  const next=route.find(s=>toMinutes(s.start)>mins);
  rounded(ctx,26,H-112,W-52,85,17,"rgba(5,11,26,.96)");
  label(ctx,now?"ESTÁS VIENDO":"TU PRÓXIMA PARADA",46,H-79,14,"#a6ff70",800);
  label(ctx,now?now.artist:(next?.artist??(route.length?"¡JORNADA COMPLETA!":"ELIGE TUS SETS")),46,H-44,25,"#ffffff",900,515);
  if(next){label(ctx,"SIGUIENTE",648,H-80,13,"#9baabf",800);label(ctx,next.start+" · "+next.artist,648,H-48,19,"#ffffff",800,390);}
  label(ctx,"RUTA ILUSTRATIVA · NO INDICA DISTANCIAS NI TIEMPOS REALES",28,H-12,12,"#8896b3",600);
}

export default function AnimatedRoute({day, allSets, attendance, tastes}:Props){
  const route=useMemo(()=>suggestRoute(allSets,day,attendance,tastes),[allSets,day,attendance,tastes]);
  const warnings=useMemo(()=>getTightStageChanges(route),[route]);
  const ref=useRef<HTMLCanvasElement>(null);
  const exportingRef=useRef(false);
  const [progress,setProgress]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [speed,setSpeed]=useState<1|2>(1);
  const [style,setStyle]=useState<AvatarStyle>("neon");
  const [accessory,setAccessory]=useState<Accessory>("headphones");
  const [exporting,setExporting]=useState(false);
  const [message,setMessage]=useState("");
  const currentClock=formatClock(DAY_START+Math.round(progress*CLOCK_RANGE));

  const draw=useCallback((value:number)=>{
    const canvas=ref.current;
    if(canvas)drawScene(canvas,allSets,route,day,value,style,accessory);
  },[allSets,route,day,style,accessory]);
  useEffect(()=>{if(!exportingRef.current)draw(progress);},[draw,progress]);

  useEffect(()=>{
    if(!playing||exporting)return;
    let request=0;
    const from=progress,started=performance.now();
    const run=(now:number)=>{
      const value=Math.min(1,from+(now-started)/(32000/speed));
      setProgress(value);
      if(value<1) request=requestAnimationFrame(run);
      else setPlaying(false);
    };
    request=requestAnimationFrame(run);
    return()=>cancelAnimationFrame(request);
    // progress is intentionally captured once at Play, never added as dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[playing,speed,exporting,day,route]);

  useEffect(()=>{setPlaying(false);setProgress(0);},[day]);
  async function exportVideo(){
    const canvas=ref.current;
    if(!canvas||!route.length){setMessage("Elige artistas o estilos para crear una ruta.");return;}
    if(typeof MediaRecorder==="undefined"||!canvas.captureStream){
      setMessage("Este navegador no permite exportar video. Puedes reproducir la animación en pantalla.");return;
    }
    const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(t=>MediaRecorder.isTypeSupported(t));
    if(!mime){setMessage("Tu navegador no admite la exportación WebM. Usa Play para verla.");return;}
    setPlaying(false);setExporting(true);exportingRef.current=true;setMessage("Generando video sin audio ni canciones con derechos de autor…");
    try {
      const stream=canvas.captureStream(24);
      const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3000000});
      const chunks:Blob[]=[];
      recorder.ondataavailable=(e)=>{if(e.data.size)chunks.push(e.data);};
      recorder.onstop=()=>{
        stream.getTracks().forEach(t=>t.stop());
        exportingRef.current=false;setExporting(false);
        if(!chunks.length){setMessage("El navegador no pudo generar el video.");draw(progress);return;}
        const url=URL.createObjectURL(new Blob(chunks,{type:"video/webm"}));
        const link=document.createElement("a");link.href=url;
        link.download="trackdjs-creamfields-ruta-"+day+".webm";
        link.click();window.setTimeout(()=>URL.revokeObjectURL(url),30000);
        setMessage("Video WebM descargado. Compártelo como archivo o video en WhatsApp.");
        draw(progress);
      };
      recorder.onerror=()=>{setMessage("La exportación falló. Prueba la reproducción en pantalla.");};
      recorder.start(250);
      const start=performance.now();
      const duration=17000;
      const frame=(now:number)=>{
        const value=Math.min(1,(now-start)/duration);
        drawScene(canvas,allSets,route,day,value,style,accessory);
        if(value<1&&recorder.state==="recording")requestAnimationFrame(frame);
        else if(recorder.state==="recording")recorder.stop();
      };
      requestAnimationFrame(frame);
    }catch{
      exportingRef.current=false;setExporting(false);
      setMessage("No fue posible crear el archivo en este navegador.");
      draw(progress);
    }
  }
  return <section className="mt-8 rounded-3xl border border-white/15 bg-[#0b0e1b] p-4 sm:p-6">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#b7ff75]"><Sparkles size={16}/> Experiencia inmersiva</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Animar mi ruta</h2><p className="mt-2 max-w-2xl text-sm text-zinc-400">Mira tu festival avanzar de 13:00 a 23:00. Tu avatar sigue los sets recomendados y los DJs cambian en cada escenario.</p></div>
      <span className="rounded-full border border-[#bcff73]/30 bg-[#bbff70]/10 px-3 py-2 text-sm text-[#caff95]">{route.length} paradas · {currentClock}</span>
    </div>
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black"><canvas ref={ref} width={SIZE.width} height={SIZE.height} className="h-auto w-full" aria-label={"Mapa esquemático animado del recorrido del "+day}/></div>
    <p className="mt-2 text-xs text-amber-200/80">Plano esquemático, no oficial. Las posiciones, distancias y desplazamientos del avatar son visuales, no indicaciones reales para caminar.</p>
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button type="button" onClick={()=>{if(progress>=1)setProgress(0);setPlaying(p=>!p);}} disabled={!route.length||exporting} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#c6ff74] px-5 py-2 font-black text-[#0b1420] disabled:opacity-40">{playing?<Pause size={17}/>:<Play size={17}/>} {playing?"Pausar":"Reproducir"}</button>
      <button type="button" onClick={()=>{setPlaying(false);setProgress(0);}} disabled={exporting} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm"><RotateCcw size={16}/> Reiniciar</button>
      <button type="button" onClick={()=>setSpeed(v=>v===1?2:1)} disabled={exporting} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm">Velocidad {speed}×</button>
      <button type="button" onClick={exportVideo} disabled={!route.length||exporting} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan/50 px-4 text-sm text-cyan disabled:opacity-40"><Download size={16}/> {exporting?"Exportando…":"Descargar video"}</button>
    </div>
    <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Mover hora del festival · {currentClock}
      <input type="range" min="0" max="1000" value={Math.round(progress*1000)} disabled={exporting} onChange={e=>{setPlaying(false);setProgress(Number(e.target.value)/1000);}} className="mt-2 w-full accent-lime-300"/>
    </label>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <fieldset className="rounded-2xl border border-white/10 p-4"><legend className="px-2 text-sm font-bold">Personaliza tu avatar</legend><div className="flex flex-wrap gap-2">{([["neon","🟢 Neón"],["violet","🟣 Violeta"],["sunset","🟠 Sunset"]] as const).map(([id,title])=><button key={id} type="button" aria-pressed={style===id} onClick={()=>setStyle(id)} className={"rounded-lg border px-3 py-2 text-sm "+(style===id?"border-lime-300 bg-white/10":"border-white/10")}>{title}</button>)}</div></fieldset>
      <fieldset className="rounded-2xl border border-white/10 p-4"><legend className="px-2 text-sm font-bold">Tu accesorio</legend><div className="flex flex-wrap gap-2">{([["headphones","🎧 Audífonos"],["glasses","🕶️ Lentes"],["cap","🧢 Gorra"]] as const).map(([id,title])=><button key={id} type="button" aria-pressed={accessory===id} onClick={()=>setAccessory(id)} className={"rounded-lg border px-3 py-2 text-sm "+(accessory===id?"border-lime-300 bg-white/10":"border-white/10")}>{title}</button>)}</div></fieldset>
    </div>
    {warnings.length>0&&<p className="mt-3 rounded-xl border border-amber-400/30 p-3 text-sm text-amber-200">⚠️ {warnings.length} transiciones con menos de 15 minutos entre escenarios. Revisa la distancia real antes de seguir esta ruta.</p>}
    {message&&<p role="status" className="mt-3 text-sm text-cyan">{message}</p>}
    <p className="mt-3 text-xs text-zinc-500">La ruta se calcula en tu dispositivo; no registra movimientos reales ni utiliza GPS. El archivo de video se genera localmente, sin música ni fotos ajenas.</p>
  </section>;
}
