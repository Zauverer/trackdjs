"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Film, Copy, ShieldCheck } from "lucide-react";
import { STAGE_META, getStyles } from "@/lib/festival/music-discovery";
import { formatClock, getAttendanceConflicts, toMinutes, type AttendanceMap, type FestivalSet, type RouteStep } from "@/lib/festival/route-engine";
import { clockProgress, raverHeartProgress } from "@/lib/festival/raver-heart";

type VideoProps = { day:string; allSets:FestivalSet[]; route:RouteStep[]; attendance:AttendanceMap };
type Dimensions={width:number;height:number};
const VERTICAL:Dimensions={width:1080,height:1920};
const RUNTIME_SECONDS=16;
const FPS=30;
const COLORS:Record<string,{primary:string;secondary:string;beam:string;pattern:"arcs"|"bars"|"diamonds"|"rings"}>={
  "MAIN STAGE":{primary:"#d8ff70",secondary:"#32e6ed",beam:"#f7efb4",pattern:"bars"},
  "A STAGE":{primary:"#59d7ff",secondary:"#fb54e2",beam:"#6cbaff",pattern:"arcs"},
  "ALTERNATIVE":{primary:"#ff648d",secondary:"#ffb349",beam:"#ed4eeb",pattern:"diamonds"},
  "HE.SHE.THEY":{primary:"#ff6a49",secondary:"#d83aff",beam:"#faedeb",pattern:"bars"},
  "RADIO CAROLINA":{primary:"#d8abff",secondary:"#88ecff",beam:"#f2beff",pattern:"rings"},
  "GRIETA X PANAL RECORDS":{primary:"#efac6b",secondary:"#ff627f",beam:"#ffd792",pattern:"diamonds"},
  "CREAM":{primary:"#68ffb5",secondary:"#72cbff",beam:"#96ffde",pattern:"arcs"},
  "FERAL":{primary:"#b39aff",secondary:"#68eff5",beam:"#d3b0ff",pattern:"rings"}
};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
function rgba(hex:string,a:number){
  const h=hex.replace("#","");
  return "rgba("+[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).join(",")+","+a+")";
}
function rounded(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,color:string){
  c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();
}
function write(c:CanvasRenderingContext2D,s:string,x:number,y:number,size:number,color:string,weight=700,maxWidth?:number){
  c.font=weight+" "+size+"px Arial,system-ui,sans-serif";c.fillStyle=color;
  if(maxWidth)c.fillText(s,x,y,maxWidth);else c.fillText(s,x,y);
}
function mark(c:CanvasRenderingContext2D,x:number,y:number,scale=1) {
  c.save();c.translate(x,y);c.scale(scale,scale);
  rounded(c,0,0,72,72,21,"#c8ff7c");
  c.strokeStyle="#0a101b";c.lineWidth=7;c.lineCap="round";
  c.beginPath();
  for(let i=0;i<5;i++){const xx=17+i*10;c.moveTo(xx,34-(i%2)*13);c.lineTo(xx,55-(i%3)*12);}
  c.stroke();c.restore();
}
function getFrameContext(allSets:FestivalSet[],route:RouteStep[],day:string,t:number) {
  const forDay=allSets.filter(s=>s.day===day);
  const opening=Math.min(...forDay.map(s=>toMinutes(s.start)));
  const closing=Math.max(...forDay.map(s=>toMinutes(s.end)));
  const minute=opening+Math.round(clamp(t)*(closing-opening));
  const active=route.find(s=>toMinutes(s.start)<=minute&&minute<toMinutes(s.end));
  const upcoming=route.find(s=>toMinutes(s.start)>minute);
  const last=route.at(-1);
  const featured=active??upcoming??last;
  return {opening,closing,minute,active,upcoming,featured,stage:featured?.stage??"MAIN STAGE"};
}
function background(c:CanvasRenderingContext2D,w:number,h:number,t:number,stage:string){
  const theme=COLORS[stage]??COLORS["MAIN STAGE"];
  const sky=c.createLinearGradient(0,0,0,h);
  const openingSky=t<.42?"#224a75":t<.62?"#6b3459":"#080b22";
  sky.addColorStop(0,openingSky);sky.addColorStop(.45,t<.56?"#82466a":"#101d3e");sky.addColorStop(1,"#070c17");
  c.fillStyle=sky;c.fillRect(0,0,w,h);
  for(let i=0;i<16;i++){
    const x=w*(i+.5)/16;
    const haze=c.createRadialGradient(x,h*.6,0,x,h*.6,w*.4);
    haze.addColorStop(0,rgba(i%2?theme.primary:theme.secondary,.13));haze.addColorStop(1,rgba(theme.primary,0));
    c.fillStyle=haze;c.fillRect(0,h*.21,w,h*.75);
  }
  for(let i=0;i<110;i++){
    const x=(i*301+117)%w,y=(i*157+89)%Math.floor(h*.38);
    c.globalAlpha=t>.65?.38:.08;c.fillStyle="#f7f6ff";c.fillRect(x,y,i%9?2:3,i%7?2:3);
  }
  c.globalAlpha=1;
}
function drawStage(c:CanvasRenderingContext2D,w:number,h:number,progress:number,stage:string,artist:string){
  const theme=COLORS[stage]??COLORS["MAIN STAGE"];
  const pulse=Math.sin(progress*75);
  c.save();c.translate(w/2,h*.48);
  const sw=w*.82,sh=h*.38;
  // Perspective truss grid and rigging.
  c.strokeStyle="#526177";c.lineWidth=8;
  c.strokeRect(-sw/2,-sh/2,sw,sh);
  for(let i=0;i<13;i++){
    const x=-sw/2+i*sw/12;c.beginPath();c.moveTo(x,-sh/2);c.lineTo(x+((i%2)*2-1)*19,-sh/2+85);c.stroke();
  }
  c.fillStyle="#090d20";c.fillRect(-sw*.46,-sh*.44,sw*.92,sh*.76);
  c.fillStyle=rgba(theme.secondary,.26);c.fillRect(-sw*.44,-sh*.42,sw*.88,sh*.72);
  // Different LED environments instead of a single generic stage.
  for(let i=0;i<12;i++){
    const x=-sw*.40+i*(sw*.8/12);
    const height=110+Math.abs(Math.sin(i*.9+progress*50))*225;
    c.fillStyle=rgba(theme.primary,.2+.55*Math.abs(Math.sin(progress*36+i*1.12)));
    if(theme.pattern==="arcs"){
      c.strokeStyle=c.fillStyle;c.lineWidth=13;
      c.beginPath();c.arc(x,-20,52+height*.15,.15*Math.PI,1.65*Math.PI);c.stroke();
    }else if(theme.pattern==="diamonds"){
      c.beginPath();c.moveTo(x,-height);c.lineTo(x+28,-height*.5);c.lineTo(x,-16);c.lineTo(x-28,-height*.5);c.fill();
    }else if(theme.pattern==="rings"){
      c.strokeStyle=c.fillStyle;c.lineWidth=10;c.beginPath();c.arc(x,-height/2,40+height*.22,0,2*Math.PI);c.stroke();
    }else c.fillRect(x,-height,18,height);
  }
  // Volumetric beams and screen highlights.
  for(let i=0;i<11;i++){
    const bx=(i-5)*sw/12;
    const drift=Math.sin(progress*64+i*2)*w*.23;
    const beam=c.createLinearGradient(bx,-sh*.43,bx+drift,-h*.52);
    beam.addColorStop(0,rgba(i%2?theme.primary:theme.beam,.50));
    beam.addColorStop(1,rgba(theme.secondary,0));
    c.fillStyle=beam;c.beginPath();c.moveTo(bx-13,-sh*.43);c.lineTo(bx+13,-sh*.43);
    c.lineTo(bx+drift+120,-h*.52);c.lineTo(bx+drift-120,-h*.52);c.fill();
  }
  c.shadowBlur=48;c.shadowColor=theme.primary;
  c.strokeStyle=theme.primary;c.lineWidth=11;c.strokeRect(-sw*.46,-sh*.44,sw*.92,sh*.76);c.shadowBlur=0;
  c.restore();
  const fontSize=artist.length>22?49:artist.length>14?62:79;
  c.textAlign="center";
  c.shadowColor=theme.primary;c.shadowBlur=30;
  write(c,artist,w/2,h*.43,fontSize,"#ffffff",900,w*.76);
  c.shadowBlur=0;c.textAlign="left";
  // Crowd silhouettes remain abstract, no person's image or avatar.
  const crowdY=h*.75;
  c.fillStyle="#050b18";c.fillRect(0,crowdY,w,h*.23);
  for(let i=0;i<100;i++){
    const x=(i*111+19)%w,y=crowdY+(i%8)*22;
    c.fillStyle=i%13===0?rgba(theme.primary,.8):"#020713";
    c.beginPath();c.ellipse(x,y,10+(i%3)*5,15+(i%4)*5,.05,0,2*Math.PI);c.fill();
  }
  const glow=c.createRadialGradient(w/2,h*.77,0,w/2,h*.77,w*.6);
  glow.addColorStop(0,rgba(theme.primary,.12+Math.abs(pulse)*.05));glow.addColorStop(1,rgba(theme.primary,0));
  c.fillStyle=glow;c.fillRect(0,h*.58,w,h*.38);
}
function renderOutro(c:CanvasRenderingContext2D,allSets:FestivalSet[],route:RouteStep[],attendance:AttendanceMap,day:string,w:number,h:number,progress:number){
  const theme=COLORS["MAIN STAGE"];
  rounded(c,65,h*.235,w-130,h*.47,36,"rgba(4,13,30,.88)");
  c.textAlign="center";
  write(c,"TU RUTA, VISTA DESDE ARRIBA",w/2,h*.274,34,"#d8e9ff",900);
  write(c,"ESQUEMA DE ORDEN, NO MAPA REAL",w/2,h*.298,23,"#8eacc1",600);
  c.textAlign="left";
  const nodes=route.slice(0,8);
  const left=w*.18,right=w*.82;
  const top=h*.34,bottom=h*.62;
  const step=nodes.length>1?(bottom-top)/(nodes.length-1):0;
  const positions=nodes.map((s,i)=>({x:i%2?right:left,y:top+i*step,s}));
  if(positions.length){
    c.beginPath();positions.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));
    c.strokeStyle="#f9df59";c.lineWidth=11;c.lineJoin="round";c.shadowColor="#ffe54c";c.shadowBlur=21;c.stroke();c.shadowBlur=0;
    positions.forEach((p,i)=>{
      const color=COLORS[p.s.stage]?.primary??theme.primary;
      c.fillStyle="#111a2c";c.beginPath();c.arc(p.x,p.y,44,0,Math.PI*2);c.fill();
      c.strokeStyle="#f8df62";c.lineWidth=6;c.stroke();
      c.textAlign="center";write(c,String(i+1),p.x,p.y+12,32,color,900);
      const direction=i%2===0?1:-1;
      c.textAlign=direction===1?"left":"right";
      const target=p.x+direction*68;
      write(c,p.s.artist.slice(0,18),target,p.y+8,25,"#ffffff",800,325);
      c.textAlign="left";
    });
  }
  const collisions=getAttendanceConflicts(allSets,attendance).filter(v=>v.first.day===day);
  if(collisions.length){
    const end=positions.at(-1);
    if(end){
      c.save();c.strokeStyle="#ffe66a";c.lineWidth=5;c.setLineDash([13,17]);
      c.beginPath();c.moveTo(end.x,end.y);c.lineTo(w/2,h*.672);c.stroke();
      c.setLineDash([]);c.restore();
      c.textAlign="center";write(c,"+"+collisions.length+" cruces: alternativas por decidir",w/2,h*.697,25,"#fff3a3",700);c.textAlign="left";
    }
  }
  // Soft end card
  c.globalAlpha=clamp((progress-.89)/.08);
  rounded(c,66,h*.79,w-132,137,28,"rgba(202,255,119,.14)");
  c.textAlign="center";write(c,"ARMA TU LINEUP Y HAZ MATCH",w/2,h*.827,38,"#caff87",900);
  write(c,"trackdjs.com",w/2,h*.858,35,"#ffffff",800);c.textAlign="left";c.globalAlpha=1;
}
export function renderInstagramJourney(
  canvas:HTMLCanvasElement,allSets:FestivalSet[],route:RouteStep[],attendance:AttendanceMap,
  day:string,progress:number,size:Dimensions=VERTICAL
){
  if(canvas.width!==size.width)canvas.width=size.width;
  if(canvas.height!==size.height)canvas.height=size.height;
  const c=canvas.getContext("2d");if(!c)return;
  const w=size.width,h=size.height;
  const scale=w/1080;c.save();c.scale(scale,scale);
  const W=1080,H=h/scale;
  const frame=getFrameContext(allSets,route,day,Math.min(1,progress/.88));
  const isOutro=progress>=.88;
  const currentStage=frame.stage;
  background(c,W,H,progress,currentStage);
  if(!isOutro){
    drawStage(c,W,H,progress,currentStage,frame.active?.artist??frame.featured?.artist??"TU LINEUP");
    const accent=COLORS[currentStage]?.primary??"#d5ff83";
    rounded(c,56,190,968,142,30,"rgba(6,13,27,.78)");
    write(c,day==="2026-11-14"?"SÁBADO 14 NOVIEMBRE":"DOMINGO 15 NOVIEMBRE",84,246,30,accent,900);
    write(c,formatClock(frame.minute),81,309,65,"#ffffff",900);
    c.textAlign="right";
    write(c,String(clockProgress(frame.minute,frame.opening,frame.closing))+"% DEL DÍA",992,309,27,"#fff",800);
    c.textAlign="left";
    rounded(c,76,375,928,8,4,"rgba(255,255,255,.23)");
    rounded(c,76,375,928*clockProgress(frame.minute,frame.opening,frame.closing)/100,8,4,accent);
    rounded(c,76,H*.615,928,158,25,"rgba(6,12,27,.86)");
    write(c,(STAGE_META[currentStage]?.label??currentStage).toUpperCase(),96,H*.657,31,accent,900);
    write(c,frame.active?.artist??"PRÓXIMO SET",96,H*.707,60,"#ffffff",900,870);
    write(c,frame.active?frame.active.start+" – "+frame.active.end:frame.featured?.start??"",96,H*.742,32,"#b7c8df",650);
    const styles=getStyles(frame.active?.artist??frame.featured?.artist??"");
    if(styles.length){write(c,styles.slice(0,2).map(s=>"#"+s).join(" "),85,H*.796,32,"#d6edff",800,860);}
  }else{
    renderOutro(c,allSets,route,attendance,day,W,H,progress);
  }
  const coverage=raverHeartProgress(allSets,Object.keys(attendance).filter(id=>attendance[id]==="voy"),day);
  // Persistent watermark; this is original TrackDJs branding, not Creamfields official branding.
  rounded(c,48,50,984,108,24,"rgba(5,12,25,.83)");
  mark(c,69,68,.98);
  write(c,"TRACKDJS",169,120,49,"#ffffff",900);
  c.textAlign="right";write(c,"MI FESTIVAL JOURNEY",1005,116,25,"#c7ff7f",800);c.textAlign="left";
  rounded(c,53,H-214,974,136,24,"rgba(4,10,25,.90)");
  write(c,"COBERTURA PLANIFICADA",81,H-171,26,"#b7cce0",750);
  write(c,coverage.percent+"%  ·  "+coverage.coveredMinutes+"/"+coverage.totalMinutes+" MIN",81,H-112,37,"#c9ff87",900);
  rounded(c,80,H-90,920,8,4,"rgba(255,255,255,.22)");
  for(const seg of coverage.segments){
    rounded(c,80+920*(seg.start-coverage.start)/Math.max(1,coverage.totalMinutes),H-90,
      920*(seg.end-seg.start)/Math.max(1,coverage.totalMinutes),8,4,"#c8ff7c");
  }
  write(c,"VISUALIZACIÓN NO OFICIAL · RUTA ILUSTRATIVA",68,H-30,21,"#d5dbe9",650);
  c.restore();
}
function makeCaption(day:string,count:number){
  const date=day==="2026-11-14"?"sábado 14":"domingo 15";
  return "🎧 Mi ruta para Creamfields Chile 2026 ("+date+") · "+count+" sets.\n"+
    "¿Coincidimos en algún escenario? Arma tu lineup y hagamos match en https://trackdjs.com\n"+
    "#TrackDJs #CreamfieldsChile #FestivalJourney";
}
export default function InstagramJourneyExport({day,allSets,route,attendance}:VideoProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [quality,setQuality]=useState<"1080"|"720">("1080");
  const [exporting,setExporting]=useState(false);
  const [notice,setNotice]=useState("");
  const [preview,setPreview]=useState(.36);
  const [supported,setSupported]=useState<"mp4"|"webm"|"none">("none");
  const chosen=useMemo(()=>allSets.filter(s=>attendance[s.id]==="voy"&&s.day===day),[allSets,attendance,day]);
  const paint=useCallback((ratio:number)=>{const c=canvasRef.current;if(c)renderInstagramJourney(c,allSets,route,attendance,day,ratio,VERTICAL);},[allSets,route,attendance,day]);
  useEffect(()=>{paint(preview);},[paint,preview]);
  useEffect(()=>{
    if(typeof MediaRecorder==="undefined")return;
    const types=["video/mp4;codecs=avc1.42E01E","video/mp4","video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"];
    const found=types.find(t=>MediaRecorder.isTypeSupported(t));
    setSupported(found?found.includes("mp4")?"mp4":"webm":"none");
  },[]);
  useEffect(()=>{setPreview(.36);},[day]);
  async function copyCaption(){
    try{await navigator.clipboard.writeText(makeCaption(day,chosen.length));setNotice("Texto para Instagram copiado.");}
    catch{setNotice("Tu navegador no permitió copiar el texto.");}
  }
  async function exportVideo(){
    const canvas=canvasRef.current;
    if(!canvas||!route.length){setNotice("Elige tus sets o estilos antes de exportar.");return;}
    if(typeof MediaRecorder==="undefined"||typeof canvas.captureStream!=="function"){
      setNotice("Tu navegador no permite grabar video desde esta página.");return;
    }
    const formats=["video/mp4;codecs=avc1.42E01E","video/mp4","video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"];
    const mime=formats.find(type=>MediaRecorder.isTypeSupported(type));
    if(!mime){setNotice("No hay un formato de grabación compatible. Usa la vista previa.");return;}
    setExporting(true);setNotice("Grabando tu Journey. Mantén la pestaña abierta.");
    const size=quality==="1080"?VERTICAL:{width:720,height:1280};
    let stream:MediaStream|null=null;
    try{
      // Preview is 1080x1920; output canvas is independent and never painted with cross-origin photos.
      const output=document.createElement("canvas");
      output.width=size.width;output.height=size.height;
      stream=output.captureStream(FPS);
      const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5_000_000});
      const parts:Blob[]=[];
      recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data);};
      recorder.onstop=()=>{
        stream?.getTracks().forEach(track=>track.stop());
        setExporting(false);
        if(!parts.length){setNotice("No se generaron fotogramas. Intenta con 720p.");return;}
        const blob=new Blob(parts,{type:mime});
        const url=URL.createObjectURL(blob);
        const anchor=document.createElement("a");anchor.href=url;
        const ext=mime.includes("mp4")?"mp4":"webm";
        anchor.download="trackdjs-journey-"+day+"-"+quality+"p."+ext;
        anchor.click();
        window.setTimeout(()=>URL.revokeObjectURL(url),60000);
        setNotice(ext==="mp4"?"Video MP4 descargado. Revisa la reproducción antes de subirlo a Instagram.":"Video WebM descargado. Instagram requiere MP4/MOV: conviértelo antes de publicarlo.");
        paint(preview);
      };
      recorder.onerror=()=>setNotice("Se interrumpió la exportación. Prueba resolución 720p.");
      recorder.start(250);
      const started=performance.now();
      const tick=(now:number)=>{
        if(recorder.state!=="recording")return;
        const p=clamp((now-started)/(RUNTIME_SECONDS*1000));
        renderInstagramJourney(output,allSets,route,attendance,day,p,size);
        if(p<1)requestAnimationFrame(tick);else recorder.stop();
      };
      requestAnimationFrame(tick);
    }catch{
      stream?.getTracks().forEach(track=>track.stop());setExporting(false);
      setNotice("La grabación falló. Prueba 720p o un navegador con MP4.");
    }
  }
  return <section className="mt-5 rounded-3xl border border-[#baff77]/25 bg-[#101729] p-4 sm:p-6" aria-label="Exportar video vertical para Instagram">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-[#c9ff85]"><Film size={17}/> Instagram Journey</p>
        <h3 className="mt-2 text-2xl font-black">Tu festival en video vertical</h3>
        <p className="mt-2 max-w-xl text-sm text-zinc-300">Escenarios, DJs, luces, reloj acelerado y cierre con recorrido amarillo. Marca TrackDJs presente en cada escena.</p></div>
      <span className="rounded-full border border-white/15 px-3 py-2 text-xs text-zinc-300">9:16 · 30 fps · {RUNTIME_SECONDS} s</span>
    </div>
    <div className="mx-auto flex max-w-sm flex-col gap-3">
      <canvas ref={canvasRef} width={1080} height={1920} className="aspect-[9/16] h-auto w-full rounded-2xl border border-white/10 bg-[#0a1021]" role="img" aria-label="Vista previa del video vertical TrackDJs"/>
      <label className="block text-xs text-zinc-300">Explora la vista previa
        <input type="range" min="0" max="100" value={Math.round(preview*100)} onChange={e=>setPreview(Number(e.target.value)/100)} className="mt-2 w-full accent-lime-300" disabled={exporting}/>
      </label>
      <label className="flex items-center justify-between gap-2 text-xs text-zinc-300">Resolución
        <select value={quality} onChange={e=>setQuality(e.target.value as "720"|"1080")} disabled={exporting} className="rounded-lg border border-white/15 bg-[#1a2338] px-3 py-2 text-white">
          <option value="1080">1080 × 1920 (Full HD)</option>
          <option value="720">720 × 1280 (ligero)</option>
        </select>
      </label>
      <button type="button" onClick={exportVideo} disabled={!route.length||exporting||supported==="none"} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#c7ff7a] px-4 font-black text-[#0b1b16] disabled:opacity-45"><Download size={18}/>{exporting?"Generando video…":supported==="mp4"?"Descargar MP4 para Instagram":supported==="webm"?"Descargar WebM (requiere convertir)":"Video no compatible"}</button>
      <button type="button" onClick={copyCaption} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 text-sm"><Copy size={17}/> Copiar caption para Instagram</button>
    </div>
    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-zinc-400"><ShieldCheck size={17} className="shrink-0"/> Exportación local y sin música de terceros; los nombres de artistas son texto y no se descargan logos externos. El fondo es una ilustración original, no footage del recinto.</p>
    {supported==="webm"&&<p className="mt-2 text-xs text-amber-200">Tu navegador solo ofrece WebM. Para publicar directamente en Instagram necesitas MP4 H.264 o MOV compatible.</p>}
    {notice&&<p className="mt-3 text-sm text-[#d9ffb1]" role="status">{notice}</p>}
  </section>;
}
