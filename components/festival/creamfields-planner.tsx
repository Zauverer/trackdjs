"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import festival from "@/lib/festival/creamfields-2026.json";

type FestivalSet = { id: string; day: string; stage: string; artist: string; start: string; end: string };
const sets = festival.sets as FestivalSet[];
const STORAGE_KEY = "trackdjs:creamfields:lineup:v1";
const MAX_SHARED = 86;
const formatDay = (day: string) => day === "2026-11-14" ? "Sábado 14" : "Domingo 15";

function safeIds(raw: string | null): string[] {
  if (!raw || raw.length > 12000) return [];
  const valid = new Set(sets.map((set) => set.id));
  return [...new Set(raw.split(",").filter((id) => valid.has(id)))].slice(0, MAX_SHARED);
}
function overlap(a: FestivalSet, b: FestivalSet) {
  return a.day === b.day && a.start < b.end && b.start < a.end;
}
function makeLink(ids: string[]) {
  const url = new URL("/app/festival/creamfields-2026", window.location.origin);
  if (ids.length) url.searchParams.set("lineup", ids.join(","));
  return url.toString();
}
function drawPoster(chosen: FestivalSet[]): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = Math.max(1350, 420 + chosen.length * 43);
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  const bg = ctx.createLinearGradient(0, 0, 1080, c.height);
  bg.addColorStop(0, "#121329"); bg.addColorStop(1, "#02040b");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#70f5d5"; ctx.font = "bold 42px Arial"; ctx.fillText("TRACKDJS  /  MI LINEUP", 65, 110);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 76px Arial"; ctx.fillText("CREAMFIELDS", 65, 208);
  ctx.font = "36px Arial"; ctx.fillStyle = "#b4b9d1"; ctx.fillText("CHILE 2026  ·  14–15 NOV", 67, 270);
  let y = 365;
  for (const day of ["2026-11-14", "2026-11-15"]) {
    const items = chosen.filter((s) => s.day === day).sort((a,b) => a.start.localeCompare(b.start));
    if (!items.length) continue;
    ctx.fillStyle = "#70f5d5"; ctx.font = "bold 35px Arial"; ctx.fillText(formatDay(day).toUpperCase(), 65, y); y += 52;
    for (const s of items) {
      ctx.fillStyle = "#fff"; ctx.font = "bold 27px Arial";
      const artist = s.artist.length > 33 ? s.artist.slice(0, 30) + "…" : s.artist;
      ctx.fillText(artist, 65, y);
      ctx.fillStyle = "#acb7cf"; ctx.font = "23px Arial";
      ctx.fillText(s.start + " · " + s.stage, 610, y); y += 43;
    }
    y += 55;
  }
  ctx.fillStyle = "#c7cee2"; ctx.font = "25px Arial";
  ctx.fillText("Crea el tuyo en " + window.location.host, 65, c.height - 70);
  ctx.fillStyle = "#7f879e"; ctx.font = "20px Arial";
  ctx.fillText("Planner independiente, no oficial · Horarios sujetos a cambios", 65, c.height - 35);
  return c;
}
async function posterFile(chosen: FestivalSet[]): Promise<File> {
  const canvas = drawPoster(chosen);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("No se pudo generar PNG")), "image/png"));
  return new File([blob], "mi-lineup-creamfields-2026.png", { type: "image/png" });
}

export default function CreamfieldsPlanner() {
  const [accepted, setAccepted] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [ids, setIds] = useState<string[]>([]);
  const [day, setDay] = useState("2026-11-14");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const loadedShared = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasShared = params.has("lineup");
    const shared = safeIds(params.get("lineup"));
    if (hasShared) { setIds(shared); loadedShared.current = true; }
    else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved) as { ids?: string[]; accepted?: boolean; privacyMode?: boolean };
          if (data.privacyMode === false && data.accepted === true) {
            setAccepted(true); setPrivacyMode(false);
            setIds(safeIds(Array.isArray(data.ids) ? data.ids.join(",") : ""));
          }
        }
      } catch { /* private browsing */ }
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      if (!accepted || privacyMode) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids, accepted: true, privacyMode: false }));
    } catch { setNotice("Tu navegador no permite guardar el lineup. Puedes exportarlo igualmente."); }
  }, [ids, accepted, privacyMode, ready]);

  const selected = useMemo(() => sets.filter((s) => ids.includes(s.id)).sort((a,b) => a.day.localeCompare(b.day) || a.start.localeCompare(b.start)), [ids]);
  const visible = useMemo(() => sets.filter((s) => s.day === day && (s.artist + " " + s.stage).toLowerCase().includes(search.toLowerCase())).sort((a,b) => a.start.localeCompare(b.start)), [day, search]);
  const conflicts = useMemo(() => selected.flatMap((a,i) => selected.slice(i+1).filter((b) => overlap(a,b)).map((b) => a.artist + " ↔ " + b.artist)), [selected]);
  const toggle = (id: string) => setIds((v) => v.includes(id) ? v.filter((x) => x !== id) : [...v,id]);

  async function share() {
    if (!selected.length) return setNotice("Selecciona al menos un set.");
    const link = makeLink(ids);
    const message = "Este es mi lineup de Creamfields Chile 2026 🎧\n" + link;
    try {
      const file = await posterFile(selected);
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: message, title: "Mi lineup Creamfields" });
        setNotice("Imagen y enlace preparados para compartir.");
      } else {
        const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 30000);
        window.open("https://wa.me/?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
        setNotice("Se descargó tu imagen y se abrió WhatsApp con el enlace. Adjunta el PNG al mensaje.");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") setNotice("No se pudo compartir. Prueba descargar la imagen.");
    }
  }
  async function download() {
    if (!selected.length) return setNotice("Selecciona al menos un set.");
    try {
      const file = await posterFile(selected);
      const url = URL.createObjectURL(file);
      const a = document.createElement("a"); a.href = url; a.download = file.name; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setNotice("Imagen PNG descargada.");
    } catch { setNotice("No se pudo crear la imagen en este navegador."); }
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(makeLink(ids)); setNotice("Enlace copiado. Quien lo abra podrá ver el lineup seleccionado."); }
    catch { setNotice("Tu navegador bloqueó la copia; usa Compartir."); }
  }
  return <main className="mx-auto max-w-6xl px-4 py-8 text-white">
    <p className="text-sm font-bold uppercase tracking-[.2em] text-cyan">TrackDJs · Beta independiente no oficial</p>
    <h1 className="mt-3 text-4xl font-black sm:text-6xl">Tu Creamfields, tu lineup.</h1>
    <p className="mt-3 max-w-2xl text-zinc-300">Elige tus sets del 14 y 15 de noviembre de 2026, revisa los cruces y comparte una imagen con tus amigos. No necesitas registrarte.</p>
    {!accepted ? <section className="mt-8 max-w-3xl rounded-2xl border border-cyan/40 bg-white/[.05] p-5">
      <h2 className="text-xl font-bold">Acuerdo de participación beta</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-300">Esta es una herramienta experimental no oficial. Los horarios son referenciales y pueden modificarse. El lineup que compartas será visible para cualquiera con el enlace. No incluyas datos personales en el enlace. Al continuar aceptas probarla bajo estas condiciones.</p>
      <label className="mt-5 flex gap-3 text-sm"><input type="checkbox" checked={agreementChecked} onChange={(e) => setAgreementChecked(e.target.checked)} className="h-5 w-5 accent-cyan" /><span>He leído y acepto el acuerdo para participar en la beta (obligatorio).</span></label>
      <label className="mt-4 flex gap-3 text-sm"><input type="checkbox" checked={privacyMode} onChange={(e) => setPrivacyMode(e.target.checked)} className="h-5 w-5 accent-cyan" /><span>Modo privado: no guardar mi selección ni mi aceptación en este dispositivo (recomendado). Puedes generar y compartir el lineup igualmente.</span></label>
      <button type="button" disabled={!agreementChecked} onClick={() => setAccepted(true)} className="mt-5 rounded-lg bg-cyan px-5 py-3 font-black text-black disabled:opacity-40">Entrar al planner beta</button>
    </section> : <section className="mt-8 rounded-xl border border-white/10 bg-white/[.04] p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><span>{privacyMode ? "Modo privado · Solo memoria de esta pestaña" : "Guardado local en este navegador · Sin cuenta"}</span><button type="button" className="underline text-cyan" onClick={() => {setAccepted(false);setAgreementChecked(false);setPrivacyMode(true);try{localStorage.removeItem(STORAGE_KEY);}catch{} }}>Revocar aceptación y borrar guardado</button></div>
    </section>}
    {accepted && <>
      <section className="mt-7 flex flex-wrap gap-3">
        {festival.dates.map((d) => <button key={d} type="button" onClick={() => setDay(d)} className={"rounded-lg px-5 py-3 font-bold " + (day===d?"bg-cyan text-black":"border border-white/20 bg-white/5")}>{formatDay(d)}</button>)}
        <input aria-label="Buscar artista o escenario" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar artista o escenario" className="min-h-12 flex-1 rounded-lg border border-white/20 bg-black/30 px-4 text-white" />
      </section>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
        <section><h2 className="mb-3 text-2xl font-extrabold">Horarios · {visible.length} sets</h2>
          <div className="grid gap-2">{visible.map((s) => <button type="button" key={s.id} onClick={() => toggle(s.id)} aria-pressed={ids.includes(s.id)} className={"flex items-center justify-between gap-3 rounded-xl border p-4 text-left " + (ids.includes(s.id)?"border-cyan bg-cyan/10":"border-white/10 bg-white/[.04]")}>
            <span><span className="block font-extrabold">{s.artist}</span><span className="text-xs text-zinc-400">{s.stage}</span></span>
            <span className="shrink-0 text-right text-sm"><span className="block">{s.start}–{s.end}</span><span className="text-cyan">{ids.includes(s.id)?"✓ Elegido":"+ Agregar"}</span></span>
          </button>)}</div>
        </section>
        <aside className="lg:sticky lg:top-6 lg:self-start rounded-2xl border border-white/10 bg-white/[.05] p-5">
          <h2 className="text-2xl font-black">Mi lineup ({selected.length})</h2>
          {!selected.length ? <p className="mt-4 text-sm text-zinc-400">Selecciona tus artistas y arma una ruta propia.</p> :
          <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">{selected.map((s) => <div key={s.id} className="flex justify-between gap-2 border-b border-white/10 pb-2 text-sm"><span>{formatDay(s.day)} · {s.start} <b className="block">{s.artist}</b><span className="text-zinc-400">{s.stage}</span></span><button type="button" className="text-cyan" onClick={() => toggle(s.id)} aria-label={"Quitar "+s.artist}>✕</button></div>)}</div>}
          {conflicts.length > 0 && <div className="mt-4 rounded-lg border border-amber-500/50 p-3 text-sm"><b>Choques de horario: {conflicts.length}</b><p className="mt-2 text-amber-200">{conflicts.slice(0,5).join(" · ")}</p></div>}
          <button type="button" onClick={share} disabled={!selected.length} className="mt-5 w-full rounded-lg bg-cyan px-4 py-3 font-black text-black disabled:opacity-40">Compartir imagen + enlace por WhatsApp</button>
          <div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={download} disabled={!selected.length} className="rounded-lg border border-white/20 p-3 text-sm disabled:opacity-40">Descargar PNG</button><button type="button" onClick={copyLink} disabled={!selected.length} className="rounded-lg border border-white/20 p-3 text-sm disabled:opacity-40">Copiar enlace</button></div>
          <p className="mt-3 text-xs leading-5 text-zinc-400">En móviles compatibles se comparte la imagen y el enlace juntos. En otros navegadores se descarga el PNG y WhatsApp se abre con el enlace, para adjuntar la imagen manualmente.</p>
        </aside>
      </div>
    </>}
    {notice && <p role="status" className="mt-5 text-sm text-cyan">{notice}</p>}
    <footer className="mt-12 border-t border-white/10 py-5 text-sm text-zinc-400">Los horarios no son oficiales ni garantizados. En modo privado este planner no guarda tu selección ni la envía a una base de datos; el alojamiento web puede procesar registros técnicos de acceso. <a href="/app" className="text-cyan underline">Explorar TrackDJs global</a></footer>
  </main>;
}
