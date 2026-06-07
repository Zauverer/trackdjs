import { ErrorState } from "@/components/error-state";

export default function EventNotFound() {
  return (
    <ErrorState
      title="Esta fiesta no está en el mapa"
      description="El evento no existe o todavía no fue cargado en TrackDJs."
      href="/app/events"
      action="Volver a eventos"
    />
  );
}
