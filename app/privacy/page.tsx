import type { Metadata } from "next";
import Link from "next/link";
export const metadata:Metadata={title:"Privacidad | TrackDJs",description:"Cómo tratamos los datos al crear y guardar un lineup de festival."};
export default function PrivacyPage(){
  return <main className="mx-auto max-w-3xl px-5 py-12 text-zinc-100">
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#c9ff85]">TRACKDJS / TRANSPARENCIA</p>
    <h1 className="mt-4 text-4xl font-black">Política de privacidad de la beta</h1>
    <p className="mt-3 text-sm text-zinc-400">Versión 2026-11-12 · Contacto: <a className="underline" href="mailto:hello@trackdjs.com">hello@trackdjs.com</a></p>
    <div className="mt-8 space-y-7 text-sm leading-7 text-zinc-300">
      <section><h2 className="text-xl font-bold text-white">1. Responsable y contacto</h2><p>TrackDJs es el nombre del servicio. Puedes ejercer consultas sobre tus datos en hello@trackdjs.com. Antes de habilitar públicamente el almacenamiento de cuentas debe confirmarse y publicarse la identificación legal completa de su responsable.</p></section>
      <section><h2 className="text-xl font-bold text-white">2. Uso sin cuenta</h2><p>La selección de sets y el cálculo de rutas funcionan en el dispositivo sin enviar esa selección a una base de datos. El lineup no se guarda automáticamente. Si decides desactivar el modo privado, la selección se mantiene temporalmente en sessionStorage de esta pestaña y se elimina al cerrarla; el guardado permanente en la nube requiere correo y consentimiento explícito. El hosting puede procesar registros técnicos necesarios para entregar la página.</p></section>
      <section><h2 className="text-xl font-bold text-white">3. Guardado con correo</h2><p>Si decides guardar en tu cuenta, se utiliza autenticación mediante enlace enviado por correo. Al confirmar expresamente el guardado, se almacenan el identificador de cuenta, los IDs de sets elegidos, los posibles y descartados, los estilos seleccionados, las versiones de documentos aceptados y las fechas de consentimiento y actualización. Estos datos se usan únicamente para conservar y recuperar tu lineup; no se exige inscripción para explorar.</p></section>
      <section><h2 className="text-xl font-bold text-white">4. Compartir con amistades</h2><p>Los enlaces de invitación contienen elecciones musicales y opcionalmente un apodo cuando activas esa casilla. Cualquier persona con el enlace puede ver las elecciones compartidas. No se crean cuentas de amigos automáticamente.</p></section>
      <section><h2 className="text-xl font-bold text-white">5. Servicios, conservación y derechos</h2><p>Podemos usar servicios de hosting y autenticación como Vercel y Supabase si están configurados. Los datos de cuenta se conservan hasta que solicites su eliminación o se cierre el servicio. Puedes solicitar acceso, corrección, eliminación o consultar la revocación de consentimientos escribiendo a hello@trackdjs.com. No se venden datos personales ni se requiere aceptar marketing para usar la beta.</p></section>
      <section><h2 className="text-xl font-bold text-white">6. Imágenes externas</h2><p>Las fotografías y logos alojados en terceros solo se cargan si habilitas expresamente esa opción. No podemos controlar los registros de acceso que recopilen los proveedores de esos archivos.</p></section>
      <p className="rounded-xl border border-amber-500/20 p-4 text-amber-100">Documento de beta pendiente de validación jurídica e identificación formal del responsable antes del lanzamiento del guardado público.</p>
    </div>
    <Link href="/creamfields-2026" className="mt-8 inline-block text-sm font-bold text-[#c9ff88]">Volver al festival</Link>
  </main>;
}
