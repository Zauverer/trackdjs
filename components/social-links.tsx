import Link from "next/link";
import { ExternalLink, Globe2, Headphones, Instagram, Mail, MapPinned, Music2, Phone, Youtube } from "lucide-react";
import {
  normalizeInstagramUrl,
  normalizeSoundCloudUrl,
  normalizeSpotifyPlaylistUrl,
  normalizeSpotifyUrl,
  normalizeTikTokUrl,
  normalizeWebsiteUrl,
  normalizeYouTubeUrl
} from "@/lib/social-url-utils";

export type SocialLinkSet = {
  instagram?: string;
  instagram_url?: string;
  tiktok?: string;
  tiktok_url?: string;
  spotify?: string;
  spotify_url?: string;
  spotify_playlist?: string;
  spotify_playlist_url?: string;
  soundcloud?: string;
  soundcloud_url?: string;
  youtube?: string;
  youtube_url?: string;
  website?: string;
  website_url?: string;
  email?: string;
  contact_email?: string;
  phone?: string;
  contact_phone?: string;
  map?: string;
  map_url?: string;
  directions?: string;
};

type SocialLinksProps = {
  links: SocialLinkSet;
  emptyText?: string;
  compact?: boolean;
};

function available(value?: string | null) {
  return Boolean(value && value.trim() && value.trim() !== "#");
}

function externalHref(value: string, kind?: "email" | "phone") {
  if (kind === "email") return value.startsWith("mailto:") ? value : `mailto:${value}`;
  if (kind === "phone") return value.startsWith("tel:") ? value : `tel:${value.replace(/\s+/g, "")}`;
  return value;
}

export function SocialLinks({ links, emptyText, compact = false }: SocialLinksProps) {
  const items = [
    { label: "Instagram", href: normalizeInstagramUrl(links.instagram_url ?? links.instagram), icon: <Instagram size={16} /> },
    { label: "TikTok", href: normalizeTikTokUrl(links.tiktok_url ?? links.tiktok), icon: <Music2 size={16} /> },
    { label: "Spotify", href: normalizeSpotifyUrl(links.spotify_url ?? links.spotify), icon: <Headphones size={16} /> },
    { label: "Playlist", href: normalizeSpotifyPlaylistUrl(links.spotify_playlist_url ?? links.spotify_playlist), icon: <Headphones size={16} /> },
    { label: "SoundCloud", href: normalizeSoundCloudUrl(links.soundcloud_url ?? links.soundcloud), icon: <Music2 size={16} /> },
    { label: "YouTube", href: normalizeYouTubeUrl(links.youtube_url ?? links.youtube), icon: <Youtube size={16} /> },
    { label: "Web", href: normalizeWebsiteUrl(links.website_url ?? links.website), icon: <Globe2 size={16} /> },
    { label: "Email", href: links.contact_email ?? links.email, kind: "email" as const, icon: <Mail size={16} /> },
    { label: "Teléfono", href: links.contact_phone ?? links.phone, kind: "phone" as const, icon: <Phone size={16} /> },
    { label: "Cómo llegar", href: links.directions ?? links.map_url ?? links.map, icon: <MapPinned size={16} /> },
  ].filter((item): item is typeof item & { href: string } => available(item.href));

  if (!items.length) {
    return emptyText ? <p className="text-sm text-muted">{emptyText}</p> : null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={`${item.label}-${item.href}`}
          href={externalHref(item.href, item.kind)}
          target={item.kind ? undefined : "_blank"}
          rel={item.kind ? undefined : "noopener noreferrer"}
          className={`inline-flex items-center gap-2 rounded-md border border-white/10 font-bold text-white transition hover:border-cyan/50 hover:text-cyan ${
            compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
          }`}
        >
          {item.icon}
          {item.label}
          {!item.kind && item.label !== "Email" && item.label !== "Teléfono" ? <ExternalLink size={13} /> : null}
        </Link>
      ))}
    </div>
  );
}
