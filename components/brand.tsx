import Link from "next/link";
import { AudioLines } from "lucide-react";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="TrackDJs home">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-void shadow-glow">
        <AudioLines size={19} />
      </span>
      <span className="text-lg font-black tracking-tight">TrackDJs</span>
    </Link>
  );
}
