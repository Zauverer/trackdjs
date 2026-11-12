"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Compass, Disc3, List, MoveHorizontal } from "lucide-react";
import { STAGE_META } from "@/lib/festival/music-discovery";
import styles from "./premium-festival.module.css";

const DATE_LABELS: Record<string, string> = {
  "2026-11-14": "SÁB 14",
  "2026-11-15": "DOM 15"
};
type Props = {
  day: string;
  stages: string[];
  selectedStage: string;
  selectedCount: number;
  coverage: number;
  onDayChange: (day:string) => void;
  onStageChange: (stage:string) => void;
  onOpenArtists: () => void;
  onSave: () => void;
};
export default function PremiumFestivalHero({
  day, stages, selectedStage, selectedCount, coverage,
  onDayChange, onStageChange, onOpenArtists, onSave
}:Props) {
  const [dialView, setDialView] = useState<"bezel"|"rail">("bezel");
  const activeIndex = Math.max(0,stages.indexOf(selectedStage));
  const count = Math.max(1,stages.length);
  const accent = STAGE_META[selectedStage]?.accent ?? "#c9ff84";
  const stageLabel=STAGE_META[selectedStage]?.label??selectedStage;
  const cssVar = {"--beam":accent,"--time":"5.5s"} as CSSProperties;
  const dialOptions=useMemo(()=>stages.map((stage,index)=>{
    const angle=2*Math.PI*index/Math.max(1,stages.length);
    return {stage,index,left:(50+40*Math.sin(angle))+"%",top:(50-40*Math.cos(angle))+"%"};
  }),[stages]);
  function shift(direction:number) {
    if(!stages.length)return;
    onStageChange(stages[(activeIndex+direction+count)%count]);
  }
  function usePointer(event:PointerEvent<HTMLDivElement>) {
    if(!stages.length)return;
    const box=event.currentTarget.getBoundingClientRect();
    const dx=event.clientX-box.left-box.width/2;
    const dy=event.clientY-box.top-box.height/2;
    if(Math.hypot(dx,dy)<box.width*.22)return; // dead-zone avoids accidental activation
    const angle=(Math.atan2(dx,-dy)+2*Math.PI)%(2*Math.PI);
    const nextIndex=Math.round(angle/(2*Math.PI)*count)%count;
    onStageChange(stages[nextIndex]);
  }
  return <section className={styles.hero} style={cssVar} aria-label="Centro de control Creamfields 2026">
    <div className={styles.ambient} aria-hidden="true">
      <div className={styles.haze}/>
      <div className={styles.stageShell}>
        <div className={styles.truss}/>
        <div className={styles.stageScreen}><div className={styles.screenBars}>{Array.from({length:13},(_,i)=><i key={i}/>)}</div></div>
        <div className={styles.crowd}/>
      </div>
      <span className={styles.beam} style={{"--x":"52%","--time":"4.8s"} as CSSProperties}/>
      <span className={styles.beam} style={{"--x":"66%","--time":"7.2s"} as CSSProperties}/>
      <span className={styles.beam} style={{"--x":"83%","--time":"5.4s"} as CSSProperties}/>
    </div>
    <div className={styles.content}>
      <div>
        <p className={styles.eyebrow}>TRACKDJS / FESTIVAL CONTROL 001</p>
        <h1 className={styles.heroHeading}>Tu festival.<br/><strong>Tu frecuencia.</strong></h1>
        <p className={styles.heroText}>Selecciona una jornada, explora los escenarios con el bisel y crea un lineup que puedas compartir y comparar con tus amigos.</p>
        <div className={styles.meta}><span>CREAMFIELDS CHILE 2026</span><span>14—15 NOV</span><span>SANTIAGO</span></div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onOpenArtists} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#c9ff83] px-5 py-3 text-sm font-black text-[#08151c]">Explorar lineup <ArrowUpRight size={17}/></button>
          <button type="button" onClick={onSave} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/30 bg-[#0c1728]/65 px-5 py-3 text-sm font-semibold text-white">Guardar mi selección</button>
        </div>
        <p className="mt-4 text-xs text-[#b4bfd4]">Puedes explorar sin cuenta. Para guardar en la nube, ingresa solo con tu correo.</p>
      </div>
      <div className={styles.controls}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-black uppercase tracking-[.16em] text-[#c9ff87]">Seleccionar fiesta</span>
          <Link href="/app/events" className={styles.eventLink}>Todas las fiestas <ArrowUpRight size={12} className="inline"/></Link>
        </div>
        <select className={styles.festivalPicker} value="creamfields" onChange={e=>{if(e.target.value==="explorar")window.location.assign("/app/events");}} aria-label="Selecciona una fiesta">
          <option value="creamfields">Creamfields Chile 2026 · 14–15 noviembre</option>
          <option value="explorar">Explorar otras fiestas en TrackDJs</option>
        </select>
        <div className="mt-4 mb-2 text-[11px] font-black uppercase tracking-[.14em] text-[#aab9cc]">Jornada</div>
        <div className={styles.days}>{Object.keys(DATE_LABELS).map(date=><button type="button" key={date} aria-pressed={day===date} onClick={()=>onDayChange(date)}>{DATE_LABELS[date]}</button>)}</div>
        <div className={styles.selectorHeading}><span>Control de escenarios</span><div className={styles.toggle} aria-label="Cambiar vista de escenarios"><button type="button" aria-pressed={dialView==="bezel"} onClick={()=>setDialView("bezel")} title="Bisel giratorio"><Disc3 size={14}/></button><button type="button" aria-pressed={dialView==="rail"} onClick={()=>setDialView("rail")} title="Lista compacta"><List size={14}/></button></div></div>
        {dialView==="bezel"?
          <>
            <div className={styles.bezel} onPointerDown={e=>{if((e.target as HTMLElement).closest("button"))return;e.currentTarget.setPointerCapture(e.pointerId);usePointer(e);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))usePointer(e);}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} aria-label="Bisel interactivo. Desliza para cambiar escenario">
              <div className={styles.bezelInner}>
                <span className={styles.knob} style={{transform:"rotate("+(-90+activeIndex*360/count)+"deg)"}} aria-hidden="true"/>
                {dialOptions.map(({stage,index,left,top})=><button type="button" key={stage} className={styles.stageNode} style={{"--left":left,"--top":top} as CSSProperties} aria-label={"Elegir "+stage} aria-pressed={selectedStage===stage} onClick={()=>onStageChange(stage)}>{String(index+1).padStart(2,"0")}</button>)}
                <div className={styles.bezelCenter} aria-live="polite"><small>STAGE</small><b>{stageLabel}</b></div>
              </div>
            </div>
            <div className={styles.dialFoot}><button type="button" aria-label="Escenario anterior" onClick={()=>shift(-1)}><ChevronLeft size={19}/></button><span><MoveHorizontal size={14} className="mx-auto mb-1"/> Desliza el bisel</span><button type="button" aria-label="Escenario siguiente" onClick={()=>shift(1)}><ChevronRight size={19}/></button></div>
          </> :
          <div className={styles.rail}>{stages.map(stage=><button key={stage} type="button" aria-pressed={selectedStage===stage} onClick={()=>onStageChange(stage)}><Compass size={13} className="mr-2 inline" />{STAGE_META[stage]?.label??stage}</button>)}</div>
        }
        <div className={styles.stats}>
          <div><b>{selectedCount}</b><small>sets elegidos</small></div>
          <div><b>{coverage}%</b><small>cobertura</small></div>
          <div><b>{stages.length}</b><small>escenarios</small></div>
        </div>
      </div>
    </div>
  </section>;
}
