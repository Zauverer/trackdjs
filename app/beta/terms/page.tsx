import type { Metadata } from "next";
import Link from "next/link";
export const metadata:Metadata={title:"Condiciones beta | TrackDJs"};
export default function BetaTerms(){
  return <main className="mx-auto max-w-3xl px-5 py-12 text-zinc-100">
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#c9ff85]">TRACKDJS / ACUERDO DE BETA</p>
    <h1 className="mt-4 text-4xl font-black">Condiciones de participación</h1>
    <p className="mt-3 text-sm text-zinc-400">Versión 2026-11-12</p>
    <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-300">
      <p>TrackDJs Creamfields 2026 es una herramienta independiente y no oficial para explorar artistas, crear lineups, exportar imágenes y comparar agendas por enlace.</p>
      <p>Los horarios y escenarios son orientativos y pueden modificarse. Las representaciones visuales de rutas no son planos físicos ni instrucciones de evacuación, accesibilidad o desplazamiento.</p>
      <p>Puedes probar la beta sin cuenta. Compartir un enlace implica divulgar los IDs de los sets seleccionados a quien lo reciba. Evita incluir información personal en apodos o publicaciones públicas.</p>
      <p>Las fotos, marcas y nombres de artistas pertenecen a sus respectivos titulares. La presencia en la aplicación no implica relación comercial, patrocinio ni aval de Creamfields ni de los artistas.</p>
      <p>Cuando habilites guardado en la nube, solicitará un consentimiento específico y autenticación por correo. Puedes retirar el consentimiento o pedir eliminación de datos en <a className="underline" href="mailto:hello@trackdjs.com">hello@trackdjs.com</a>.</p>
      <p>Este texto de beta necesita revisión jurídica antes de activar el almacenamiento público de cuentas.</p>
    </div>
    <Link href="/creamfields-2026" className="mt-8 inline-block text-sm font-bold text-[#c9ff88]">Regresar a TrackDJs</Link>
  </main>;
}
