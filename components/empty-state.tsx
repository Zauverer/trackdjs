import Link from "next/link";

export function EmptyState({ title, href, action }: { title: string; href: string; action: string }) {
  return (
    <div className="glass rounded-lg p-5 text-center">
      <p className="text-sm text-muted">{title}</p>
      <Link href={href} className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-black text-void">
        {action}
      </Link>
    </div>
  );
}
