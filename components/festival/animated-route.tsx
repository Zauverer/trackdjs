"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import InstagramJourneyExport from "@/components/festival/instagram-journey-export";
import { clockProgress } from "@/lib/festival/raver-heart";
import { STAGE_META, type MusicStyle } from "@/lib/festival/music-discovery";
import { type AttendanceMap, type FestivalSet, type RouteStep, suggestRoute, toMinutes, formatClock, getTightStageChanges } from "@/lib/festival/route-engine";

type Props={day:string;allSets:FestivalSet[];attendance:AttendanceMap;tastes:MusicStyle[]};
const W=1100,H=650;
const dayLimits=(sets:FestivalSet[],day:string)=>{const matching=sets.filter(s=>s.day===day);return {first:Math.min(...matching.map(s=>toMinutes(s.start))),last:Math.max(...matching.map(s=>toMinutes(s.end)))};};
const firstColor=(stage:string)=>STAGE_META[stage]?.accent??"#baff81";
const activeAt=(sets:FestivalSet[],day:string,stage:string,minute:number)=>
  sets.find(s=>s.day===day&&s.stage===stage&&toMinutes(s.start)<=minute&&minute<toMinutes(s.end));
function rgba(hex:string,alpha:number){
  const raw=hex.replace("#","");
  const parts=[0,2,4].map(i=>parseInt(raw.slice(i,i+2),16));
  return "rgba("+parts.join(",")+","+alpha+")";
}
function block(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,color:string){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=color;ctx.fill();
}
function text(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,size:number,color:string,weight:number=700,maxWidth?:number){
  ctx.fillStyle=color;ctx.font=weight+" "+size+"px system-ui,Arial,sans-serif";
  if(maxWidth)ctx.fillText(value,x,y,maxWidth);else ctx.fillText(value,x,y);
}
function phaseInfo(minute:number){
  // Artistic time-of-day transition, not a claim about the real sunset.
  if(minute<1020)return {label:"TARDE",a:"#1e4d86",b:"#80b6cd",c:"#d6e9be",stars:0};
  if(minute<1140){
    const p=(minute-1020)/120;
    return {label:"ATARDECER",a:"#31255f",b:p>.5?"#8d4569":"#dc715d",c:"#f4b568",stars:p*.4};
  }
  return {label:"NOCHE",a:"#070b26",b:"#1a1e51",c:"#181d3c",stars:1};
}
function renderScene(canvas:HTMLCanvasElement,allSets:FestivalSet[],route:RouteStep[],day:string,ratio:number,manualStage:string|null){
  if(canvas.width!==W)canvas.width=W;if(canvas.height!==H)canvas.height=H;
  const ctx=canvas.getContext("2d");if(!ctx)return;
  const limits=dayLimits(allSets,day);
  const minute=limits.first+Math.round(ratio*(limits.last-limits.first));
  const current=route.find(s=>toMinutes(s.start)<=minute&&minute<toMinutes(s.end));
  const upcoming=route.find(s=>toMinutes(s.start)>minute);
  const stage=manualStage??current?.stage??upcoming?.stage??route.at(-1)?.stage??"MAIN STAGE";
  const accent=firstColor(stage),theme=phaseInfo(minute);
  const active=activeAt(allSets,day,stage,minute);
  const gradient=ctx.createLinearGradient(0,0,0,H);
  gradient.addColorStop(0,theme.a);gradient.addColorStop(.52,theme.b);gradient.addColorStop(1,theme.c);
  ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
  // Stars fade in during the night; no GPS or fake physical stage positioning.
  for(let i=0;i<75;i++){
    ctx.globalAlpha=theme.stars*(.35+(i%5)/9);
    ctx.fillStyle="#f4f4ff";ctx.beginPath();
    ctx.arc((i*211+51)%W,(i*97+38)%345,(i%3===0?1.8:.9),0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.fillStyle=theme.label==="NOCHE"?"#e3e9ff":"#ffe1a1";
  ctx.beginPath();ctx.arc(875,170,theme.label==="NOCHE"?25:40,0,Math.PI*2);ctx.fill();
  const skyline=ctx.createLinearGradient(0,315,0,H);
  skyline.addColorStop(0,"#1a1e39");skyline.addColorStop(1,"#060b18");
  ctx.fillStyle=skyline;ctx.beginPath();ctx.moveTo(0,510);
  for(let x=0;x<=W;x+=45){
    ctx.lineTo(x,428-(x%5)*12-(Math.floor(x/100)%4)*18);
    ctx.lineTo(x+44,428-(x%5)*12-(Math.floor(x/100)%4)*18);
  }
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
  // Distinct stage design accents: main screen, LED pillars, truss and rotating beams.
  const offset=Math.sin(ratio*120),beamCount=stage==="ALTERNATIVE"?8:stage==="HE.SHE.THEY"?7:5;
  ctx.save();ctx.translate(W/2,355);
  for(let i=0;i<beamCount;i++){
    const fromX=(i-(beamCount-1)/2)*90;
    const spread=(i-(beamCount-1)/2)*125+offset*120;
    const light=ctx.createLinearGradient(fromX,-145,spread,-380);
    light.addColorStop(0,rgba(accent,theme.label==="TARDE"?.12:.34));
    light.addColorStop(1,rgba(accent,0));
    ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(fromX-10,-140);ctx.lineTo(fromX+10,-140);ctx.lineTo(spread+90,-430);ctx.lineTo(spread-90,-430);ctx.fill();
  }
  ctx.fillStyle="#070b15";ctx.fillRect(-352,-155,704,314);
  ctx.strokeStyle="#5d6b87";ctx.lineWidth=8;ctx.strokeRect(-360,-166,720,330);
  ctx.strokeStyle=accent;ctx.lineWidth=10;ctx.strokeRect(-337,-138,674,269);
  // LED panel shape varies by stage to make each scene visually recognizable.
  const bars=stage==="CREAM"?8:stage==="ALTERNATIVE"?14:stage==="FERAL"?10:12;
  for(let i=0;i<bars;i++){
    const x=-290+i*(580/(bars-1));
    const h=22+((i*13+Math.floor(minute/7))%6)*23;
    ctx.fillStyle=rgba(accent,.22+.24*Math.abs(Math.sin(i*1.4+ratio*23)));
    ctx.fillRect(x,117-h,19,h);
  }
  text(ctx,(STAGE_META[stage]?.label??stage).toUpperCase(),-310,-90,25,accent,900,620);
  if(active){
    text(ctx,active.artist,-310,-18,active.artist.length>21?31:46,"#ffffff",900,625);
    text(ctx,active.start+" – "+active.end,-308,25,24,"#c9d2e9",700);
    block(ctx,-310,53,195,43,12,rgba(accent,.20));
    text(ctx,"SONANDO AHORA",-294,81,17,accent,900);
  }else{
    text(ctx,"ENTRE SETS",-310,-12,43,"#ffffff",900);
    text(ctx,"Revisa el próximo horario",-310,31,22,"#a8b5d1",600);
  }
  ctx.restore();
  // Stage-specific visual bars/podium, stylized crowd without human avatar.
  block(ctx,0,510,W,140,0,"#060b15");
  for(let i=0;i<18;i++){
    const x=30+i*62;
    ctx.fillStyle=rgba(accent,.12+.25*Math.abs(Math.sin(ratio*90+i)));
    ctx.fillRect(x,515,12,105);
  }
  for(let i=0;i<90;i++){
    const x=(i*71+19)%W,y=548+(i%6)*15;
    ctx.fillStyle=(i%7===0)?rgba(accent,.7):"#050a13";
    ctx.beginPath();ctx.arc(x,y,8+(i%3)*2,0,Math.PI*2);ctx.fill();
  }
  block(ctx,22,20,1056,88,18,"rgba(3,8,22,.78)");
  text(ctx,"TRACKDJS  /  CREAMFIELDS SCENE",44,53,18,"#c8ff86",900);
  text(ctx,theme.label+" · "+(day==="2026-11-14"?"SÁBADO 14":"DOMINGO 15"),44,84,18,"#e4eafa",650);
  block(ctx,858,37,190,56,14,accent);
  text(ctx,formatClock(minute),877,78,35,"#0a1319",900);
  block(ctx,23,H-100,1054,71,16,"rgba(8,14,30,.92)");
  const featured=manualStage?active:current;
  text(ctx,manualStage?"EXPLORANDO STAGE":current?"TU RUTA AHORA":"PRÓXIMA PARADA",42,H-71,14,accent,900);
  text(ctx,featured?.artist??upcoming?.artist??(route.length?"JORNADA COMPLETADA":"ARMA TU RUTA"),42,H-41,26,"#fff",900,600);
  if(upcoming){text(ctx,"LUEGO: "+upcoming.start+" · "+upcoming.artist,682,H-44,17,"#d0dbe9",700,365);}
  text(ctx,"ENTORNO ILUSTRATIVO · NO ES UN PLANO FÍSICO",30,H-8,12,"#e2e8f0",600);
}
export default function AnimatedRoute({day,allSets,attendance,tastes}:Props){
  const route=useMemo(()=>suggestRoute(allSets,day,attendance,tastes),[allSets,day,attendance,tastes]);
  const warnings=useMemo(()=>getTightStageChanges(route),[route]);
  const stages=useMemo(()=>[...new Set(allSets.filter(s=>s.day===day).map(s=>s.stage))],[allSets,day]);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const recordingRef=useRef(false);
  const [progress,setProgress]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [speed,setSpeed]=useState<1|2>(1);
  const [manualStage,setManualStage]=useState<string|null>(null);
  const [exporting,setExporting]=useState(false);
  const [message,setMessage]=useState("");
  const limits=useMemo(()=>dayLimits(allSets,day),[allSets,day]);
  const minute=limits.first+Math.round(progress*(limits.last-limits.first));
  const currentStage=manualStage??route.find(s=>toMinutes(s.start)<=minute&&minute<toMinutes(s.end))?.stage??route.find(s=>toMinutes(s.start)>minute)?.stage??route.at(-1)?.stage??"MAIN STAGE";
  const dayLabel=phaseInfo(minute).label;
  const paint=useCallback((ratio:number)=>{
    if(canvasRef.current)renderScene(canvasRef.current,allSets,route,day,ratio,manualStage);
  },[allSets,route,day,manualStage]);
  useEffect(()=>{if(!recordingRef.current)paint(progress);},[paint,progress]);
  useEffect(()=>{
    if(!playing||exporting)return;
    let animation=0;
    const initial=progress,start=performance.now();
    const frame=(now:number)=>{
      const next=Math.min(1,initial+(now-start)/(32000/speed));
      setProgress(next);
      if(next<1)animation=requestAnimationFrame(frame);else setPlaying(false);
    };
    animation=requestAnimationFrame(frame);
    return()=>cancelAnimationFrame(animation);
    // progress intentionally captured once per Play action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[playing,speed,day,exporting,route]);
  useEffect(()=>{setPlaying(false);setProgress(0);setManualStage(null);},[day]);
  async function exportVideo(){
    const canvas=canvasRef.current;
    if(!canvas||!route.length){setMessage("Elige sets o estilos para generar tu ruta.");return;}
    if(typeof MediaRecorder==="undefined"||!canvas.captureStream){
      setMessage("Este navegador no puede exportar video. Puedes ver la animación interactiva.");return;
    }
    const mime=["video/mp4;codecs=avc1.42E01E","video/mp4","video/webm;codecs=vp9","video/webm"].find(t=>MediaRecorder.isTypeSupported(t));
    if(!mime){setMessage("Este navegador no admite exportación MP4/WebM.");return;}
    setPlaying(false);setExporting(true);recordingRef.current=true;setMessage("Preparando la secuencia de escenarios...");
    let stream:MediaStream|null=null;
    try{
      stream=canvas.captureStream(24);
      const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3_000_000});
      const chunks:Blob[]=[];
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onerror=()=>{setMessage("No fue posible grabar el video en este navegador.");};
      recorder.onstop=()=>{
        stream?.getTracks().forEach(t=>t.stop());
        recordingRef.current=false;setExporting(false);
        if(!chunks.length){setMessage("No se generó el archivo. Usa la reproducción interactiva.");paint(progress);return;}
        const url=URL.createObjectURL(new Blob(chunks,{type:mime}));
        const link=document.createElement("a");link.href=url;
        link.download="mi-creamfields-escenarios-"+day+(mime.includes("mp4")?".mp4":".webm");
        link.click();window.setTimeout(()=>URL.revokeObjectURL(url),30000);
        setMessage("Video descargado. El formato compatible depende de tu dispositivo.");paint(progress);
      };
      recorder.start(250);
      const start=performance.now(),duration=16000;
      const frame=(now:number)=>{
        const value=Math.min(1,(now-start)/duration);
        renderScene(canvas,allSets,route,day,value,manualStage);
        if(value<1&&recorder.state==="recording")requestAnimationFrame(frame);
        else if(recorder.state==="recording")recorder.stop();
      };
      requestAnimationFrame(frame);
    }catch{
      stream?.getTracks().forEach(t=>t.stop());
      recordingRef.current=false;setExporting(false);setMessage("No fue posible exportar video.");
      paint(progress);
    }
  }
  return <section id="animated-route" className="mt-8 scroll-mt-24 rounded-3xl border border-white/15 bg-[#0b1020] p-4 sm:p-6">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#b7ff75]"><Sparkles size={16}/> Escenarios vivos</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Animar mi ruta</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">Avanza de la tarde al atardecer y la noche. Cambian la iluminación, el escenario y el DJ que está tocando. Sin avatar.</p></div>
      <span className="rounded-full border border-[#bcff73]/30 bg-[#bbff70]/10 px-3 py-2 text-sm text-[#caff95]">{dayLabel} · {formatClock(minute)} · {clockProgress(minute,limits.first,limits.last)}% del reloj</span>
    </div>
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black"><canvas ref={canvasRef} width={W} height={H} className="h-auto w-full" role="img" aria-label={"Animación ilustrativa de "+currentStage+" a las "+formatClock(minute)+", ambiente "+dayLabel}/></div>
    <p className="mt-2 text-xs text-zinc-400">Visualización artística basada en los horarios; no representa la infraestructura real ni la ubicación física de los escenarios.</p>
    <div className="mt-4 flex flex-wrap gap-2" aria-label="Selecciona un escenario">
      <button type="button" onClick={()=>setManualStage(null)} aria-pressed={manualStage===null} className={"rounded-xl border px-3 py-2 text-xs font-bold "+(manualStage===null?"border-[#c6ff75] bg-[#c6ff75]/15 text-[#caff91]":"border-white/15")}>↳ Seguir mi ruta</button>
      {stages.map(stage=><button key={stage} type="button" onClick={()=>setManualStage(stage)} aria-pressed={currentStage===stage} className={"rounded-xl border px-3 py-2 text-xs "+(currentStage===stage?"border-[#c6ff75] bg-[#c6ff75]/15 text-[#caff91]":"border-white/15")}>{STAGE_META[stage]?.label??stage}</button>)}
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button type="button" onClick={()=>{if(progress>=1)setProgress(0);setPlaying(v=>!v);}} disabled={!route.length||exporting} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#c6ff74] px-5 py-2 font-black text-[#0b1420] disabled:opacity-40">{playing?<Pause size={17}/>:<Play size={17}/>} {playing?"Pausar":"Reproducir"}</button>
      <button type="button" onClick={()=>{setPlaying(false);setProgress(0);}} disabled={exporting} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm"><RotateCcw size={16}/> Reiniciar</button>
      <button type="button" onClick={()=>setSpeed(v=>v===1?2:1)} disabled={exporting} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm">Velocidad {speed}×</button>
      <button type="button" onClick={exportVideo} disabled={!route.length||exporting} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan/50 px-4 text-sm text-cyan disabled:opacity-40"><Download size={16}/> {exporting?"Exportando…":"Descargar video"}</button>
    </div>
    <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Hora del festival · {formatClock(minute)}
      <input type="range" min="0" max="1000" value={Math.round(progress*1000)} disabled={exporting} onChange={e=>{setPlaying(false);setProgress(Number(e.target.value)/1000);}} className="mt-2 w-full accent-lime-300" aria-label="Posición del reloj del festival"/>
      <span className="mt-1 flex justify-between text-[10px] text-zinc-400"><span>{formatClock(limits.first)} · 0%</span><span>Hora: {formatClock(minute)}</span><span>{formatClock(limits.last)} · 100%</span></span>
    </label>
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      {stages.filter((s)=>s===currentStage||stages.indexOf(s)<2).slice(0,3).map(stage=>{
        const active=activeAt(allSets,day,stage,minute);
        return <button type="button" key={stage} onClick={()=>setManualStage(stage)} className="rounded-xl border border-white/10 bg-white/[.035] p-3 text-left">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{color:firstColor(stage)}}>{STAGE_META[stage]?.label??stage}</span>
          <span className="mt-1 block truncate text-sm font-bold">{active?.artist??"Próximo set"}</span>
        </button>;
      })}
    </div>
    {warnings.length>0&&<p className="mt-3 rounded-xl border border-amber-400/30 p-3 text-sm text-amber-200">⚠️ {warnings.length} cambios de escenario con menos de 15 minutos de margen. Confirma distancias reales antes de caminar.</p>}
    {message&&<p role="status" className="mt-3 text-sm text-cyan">{message}</p>}
    <p className="mt-3 text-xs text-zinc-500">El reloj va del 0% en el primer minuto al 100% en el último minuto. La cobertura real de sets guardados se calcula aparte y no añade traslados desconocidos. No utilizamos GPS.</p>
    <InstagramJourneyExport day={day} allSets={allSets} route={route} attendance={attendance}/>
  </section>;
}
