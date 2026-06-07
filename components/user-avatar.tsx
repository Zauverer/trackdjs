import { initials } from "@/lib/utils";

export function UserAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-16 w-16 text-lg"
  };

  return (
    <div className={`${sizes[size]} grid shrink-0 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-neon via-pulse to-cyan font-black text-white shadow-cyan`}>
      {initials(name)}
    </div>
  );
}
