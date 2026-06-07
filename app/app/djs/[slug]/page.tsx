import { notFound } from "next/navigation";
import { djs, getDJ } from "@/lib/data";
import { DJProfileClient } from "./dj-profile-client";

export function generateStaticParams() {
  return djs.map((dj) => ({ slug: dj.slug }));
}

export default async function DJProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dj = getDJ(slug);

  if (!dj) {
    notFound();
  }

  return <DJProfileClient dj={dj} />;
}
