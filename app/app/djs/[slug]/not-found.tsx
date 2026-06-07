import { ErrorState } from "@/components/error-state";

export default function DJNotFound() {
  return (
    <ErrorState
      title="Este DJ no está cargado"
      description="El perfil todavía no existe o quedó pendiente para la carga real de backend."
      href="/app/djs"
      action="Volver a DJs"
    />
  );
}
