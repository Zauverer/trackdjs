import Link from "next/link";

export function ErrorState({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return (
    <div className="glass mx-auto max-w-xl rounded-lg p-6 text-center">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-pulse">No encontrado</p>
      <h1 className="mt-3 text-3xl font-black text-white">{title}</h1>
      <p className="mt-3 leading-7 text-muted">{description}</p>
      <Link href={href} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 py-2 text-sm font-black text-void hover:bg-cyan">
        {action}
      </Link>
    </div>
  );
}
