import { badges } from "@/lib/data";

export function getBadges() {
  return badges;
}

export function getBadgeById(id: string) {
  return badges.find((badge) => badge.id === id);
}
