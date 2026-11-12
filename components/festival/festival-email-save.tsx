"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Cloud, LockKeyhole, Mail, ShieldCheck, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { encodeSelection } from "@/lib/festival/route-engine";
import festival from "@/lib/festival/creamfields-2026.json";
import type { FestivalSet } from "@/lib/festival/route-engine";

const AGREEMENT_VERSION = "2026-11-12";
const FESTIVAL_KEY = "creamfields-chile-2026";
// Explicit opt-in for production rollout after SQL, redirect and legal checks.
const CLOUD_SAVE_ENABLED = process.env.NEXT_PUBLIC_FESTIVAL_SAVE_ENABLED === "true";
type Saved = {
  selected_ids: string[];
  maybe_ids: string[];
  no_ids: string[];
  favorite_styles: string[];
};
type Props = Saved & {
  onClose: () => void;
  onRestore: (data:Saved) => void;
};
const allSets=festival.sets as FestivalSet[];
const validIds = new Set(allSets.map((s) => s.id));
const validStyles = new Set(["techno","hard-techno","house","tech-house","melodic","edm","hardstyle","bass","latin-house","trance"]);
function sanitize(raw:string[]) {
  return [...new Set(raw)].filter((id) => validIds.has(id)).slice(0,86);
}
export default function FestivalEmailSave({selected_ids,maybe_ids,no_ids,favorite_styles,onClose,onRestore}:Props) {
  const client = useMemo(()=>createSupabaseBrowserClient(),[]);
  const [userId,setUserId] = useState<string|null>(null);
  const [userEmail,setUserEmail] = useState("");
  const [email,setEmail] = useState("");
  const [accepted,setAccepted] = useState(false);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [saved,setSaved] = useState(false);
  useEffect(()=>{
    let active=true;
    if(!client||!CLOUD_SAVE_ENABLED){setLoading(false);return;}
    void client.auth.getUser().then(({data,error})=>{
      if(!active)return;
      if(data.user&&!error){setUserId(data.user.id);setUserEmail(data.user.email??"");}
      setLoading(false);
    }).catch(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[client]);

  async function save() {
    if(!client||!CLOUD_SAVE_ENABLED||!userId||!accepted)return;
    setBusy(true);setMessage("");
    const ids=sanitize(selected_ids);
    const maybe=sanitize(maybe_ids).filter(id=>!ids.includes(id));
    const no=sanitize(no_ids).filter(id=>!ids.includes(id)&&!maybe.includes(id));
    const styles=[...new Set(favorite_styles)].filter(x=>validStyles.has(x)).slice(0,10);
    const {error}=await client.from("festival_lineups").upsert({
      user_id:userId,
      festival_key:FESTIVAL_KEY,
      selected_ids:ids,
      maybe_ids:maybe,
      no_ids:no,
      favorite_styles:styles,
      privacy_notice_version:AGREEMENT_VERSION,
      beta_agreement_version:AGREEMENT_VERSION,
      consent_at:new Date().toISOString(),
      updated_at:new Date().toISOString()
    },{onConflict:"user_id,festival_key"});
    setBusy(false);
    if(error){
      setMessage("No se pudo guardar. Comprueba que el proyecto Supabase tenga aplicada la migración de lineups.");
      return;
    }
    setSaved(true);setMessage("Lineup guardado en tu cuenta. Puedes recuperarlo con tu correo.");
    // Remove short restoration data from address bar when saved.
    if(new URLSearchParams(window.location.search).has("resume"))window.history.replaceState(null,"",window.location.pathname);
  }
  async function sendLink(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!client||!CLOUD_SAVE_ENABLED||!accepted)return;
    setBusy(true);setMessage("");
    const safeEmail=email.trim().toLowerCase();
    const selections=[
      encodeSelection(sanitize(selected_ids),allSets),
      encodeSelection(sanitize(maybe_ids),allSets),
      encodeSelection(sanitize(no_ids),allSets)
    ].join(".");
    const next="/creamfields-2026?resume="+encodeURIComponent(selections);
    const redirect=new URL("/auth/callback",window.location.origin);
    redirect.searchParams.set("next",next);
    const {error}=await client.auth.signInWithOtp({
      email:safeEmail,
      options:{emailRedirectTo:redirect.toString(),shouldCreateUser:true}
    });
    setBusy(false);
    if(error){setMessage("No se pudo enviar el correo: "+error.message);return;}
    setMessage("Revisa tu correo y abre el enlace. Tu selección viajará en el enlace para que confirmes el guardado cuando regreses.");
  }
  async function restore() {
    if(!client||!CLOUD_SAVE_ENABLED||!userId)return;
    setBusy(true);setMessage("");
    const {data,error}=await client.from("festival_lineups")
      .select("selected_ids,maybe_ids,no_ids,favorite_styles")
      .eq("user_id",userId).eq("festival_key",FESTIVAL_KEY).maybeSingle();
    setBusy(false);
    if(error){setMessage("No se pudo recuperar el lineup. Comprueba la base de datos.");return;}
    if(!data){setMessage("Todavía no hay un lineup guardado para esta cuenta.");return;}
    onRestore({
      selected_ids:sanitize(data.selected_ids??[]),
      maybe_ids:sanitize(data.maybe_ids??[]),
      no_ids:sanitize(data.no_ids??[]),
      favorite_styles:(data.favorite_styles??[]).filter((v:string)=>validStyles.has(v))
    });
    setMessage("Tu agenda se recuperó correctamente.");
  }
  return <div role="dialog" aria-modal="true" aria-labelledby="save-festival-title" className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#03080e]/85 p-4 backdrop-blur-md">
    <div className="my-auto w-full max-w-lg rounded-[2rem] border border-[#c7ff80]/25 bg-[#101a29] p-5 text-white shadow-2xl sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-[#c9ff81]"><Cloud size={18}/> TRACKDJS / MI CUENTA</span>
        <button type="button" onClick={onClose} aria-label="Cerrar ventana" className="rounded-full border border-white/20 p-2"><X size={19}/></button>
      </div>
      <h2 id="save-festival-title" className="mt-5 text-3xl font-black tracking-tight">Guarda tu experiencia.</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-300">Explorar, compartir y descargar sigue siendo gratis y sin cuenta. Para guardar y recuperar tu lineup en otros dispositivos solo necesitas un correo electrónico.</p>
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[.035] p-3 text-xs text-zinc-300"><span>{selected_ids.length} sets marcados Voy</span><span className="text-right">{favorite_styles.length} estilos elegidos</span></div>
      <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-zinc-200">
        <input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-lime-300"/>
        <span>Autorizo expresamente guardar mis sets y preferencias en mi cuenta de TrackDJs, asociada a mi correo. Leí la <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-[#c9ff80]">Política de Privacidad</a> y las <a href="/beta/terms" target="_blank" rel="noopener noreferrer" className="underline text-[#c9ff80]">condiciones beta</a>. Puedo solicitar borrar mis datos.</span>
      </label>
      {!client||!CLOUD_SAVE_ENABLED?<p className="mt-5 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">El guardado online está en fase de activación. Requiere Supabase, tablas de lineups y aprobación de privacidad. Puedes seguir usando el modo invitado, compartir tu enlace y exportar la agenda.</p>:
      loading?<p className="mt-5 text-sm text-zinc-400">Comprobando tu sesión…</p>:
      userId?<div className="mt-5 space-y-3">
        <p className="flex items-center gap-2 text-sm text-[#c8ff88]"><CheckCircle2 size={18}/> Cuenta verificada: {userEmail||"Acceso por correo"}</p>
        <button type="button" disabled={!accepted||busy} onClick={()=>void save()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9ff82] px-4 font-black text-[#091710] disabled:opacity-40"><LockKeyhole size={18}/>{busy?"Guardando…":"Guardar en mi cuenta"}</button>
        <button type="button" disabled={busy} onClick={()=>void restore()} className="min-h-11 w-full rounded-xl border border-white/20 px-4 text-sm font-bold">Recuperar mi último lineup</button>
      </div>:
      <form onSubmit={e=>void sendLink(e)} className="mt-5 space-y-3">
        <label className="block text-sm font-bold" htmlFor="save-email">Tu correo electrónico</label>
        <input id="save-email" required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="min-h-12 w-full rounded-xl border border-white/25 bg-white/[.04] px-4 text-white outline-none focus:border-[#c9ff88]"/>
        <button type="submit" disabled={!accepted||busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9ff82] px-4 font-black text-[#091710] disabled:opacity-40"><Mail size={18}/>{busy?"Enviando…":"Enviarme enlace para guardar"}</button>
        <p className="text-xs text-zinc-400">Sin contraseña. El correo solo se enviará al pulsar el botón; enviar el enlace no guarda todavía tu selección.</p>
      </form>}
      {message&&<p role="status" className={"mt-4 rounded-xl border p-3 text-sm "+(saved?"border-[#baff76]/40 text-[#cfff9f]":"border-white/15 text-zinc-200")}>{message}</p>}
      <p className="mt-4 flex gap-2 text-xs text-zinc-500"><ShieldCheck size={17} className="shrink-0"/>No registramos automáticamente a tus amigos ni enviamos tu selección antes de tu autorización.</p>
    </div>
  </div>;
}
