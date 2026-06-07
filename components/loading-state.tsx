export function LoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="glass grid min-h-40 place-items-center rounded-lg p-6 text-center">
      <div>
        <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-cyan shadow-cyan" />
        <p className="mt-4 text-sm font-bold text-muted">{label}</p>
      </div>
    </div>
  );
}
