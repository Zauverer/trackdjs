import { producers } from "@/lib/data";

export function getProducers() {
  return producers;
}

export function getProducerBySlug(slug: string) {
  return producers.find((producer) => producer.slug === slug);
}
