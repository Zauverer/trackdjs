import { ImageResponse } from "next/og";
import festival from "@/lib/festival/creamfields-2026.json";
import { decodeSelection, type FestivalSet } from "@/lib/festival/route-engine";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ids = decodeSelection(url.searchParams.get("invite"), festival.sets as FestivalSet[]);
  const artists = (festival.sets as FestivalSet[]).filter((s) => ids.includes(s.id)).map((s) => s.artist);
  const sample = [...new Set(artists)].slice(0, 4);
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",background:"linear-gradient(128deg,#151433 0%,#0b2030 58%,#071018 100%)",color:"#ffffff",padding:65,fontFamily:"sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,color:"#c5ff79",fontSize:30,fontWeight:800}}>◉ TRACKDJS <span style={{color:"#ffffff",fontSize:22}}>· CREAMFIELDS CHILE 2026</span></div>
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{fontSize:77,fontWeight:900,letterSpacing:-3,lineHeight:1.05}}>{ids.length?"¿CUÁNTOS SETS":"TU FESTIVAL."}<br/>{ids.length?"COMPARTIMOS?":"TU LINEUP."}</div>
        <div style={{fontSize:31,color:"#bfe4d2"}}>{ids.length?ids.length+" sets elegidos · ¿Hacemos match?":"Crea tu ruta y compártela con amigos"}</div>
      </div>
      <div style={{display:"flex",gap:14}}>
        {sample.map((name,index)=><div key={name+index} style={{display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #667a8c",background:"#213044",borderRadius:14,padding:"13px 19px",fontSize:20,fontWeight:700}}>{name}</div>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:25,color:"#c7ff7f",fontWeight:700}}>
        <span>TRACKDJS.COM</span><span style={{fontSize:18,color:"#9db0c0"}}>PLANIFICADOR INDEPENDIENTE · NO OFICIAL</span>
      </div>
    </div>,
    {width:1200,height:630}
  );
}
