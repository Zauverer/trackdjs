import { Search } from "lucide-react";

export function SearchBar({ placeholder = "Buscar DJs, fiestas, ciudades..." }: { placeholder?: string }) {
  return (
    <label className="glass flex h-12 items-center gap-3 rounded-lg px-4 text-muted">
      <Search size={18} />
      <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500" placeholder={placeholder} />
    </label>
  );
}
