const urlLikePattern = /^(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,})(\S*)$/i;

export function isValidUrl(value?: string | null) {
  if (!value?.trim()) return false;
  try {
    const normalized = value.trim().startsWith("http") ? value.trim() : `https://${value.trim()}`;
    const url = new URL(normalized);
    return Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}

export function isValidUsernameSlug(value?: string | null) {
  const text = value?.trim();
  if (!text) return false;
  if (text.includes("@") || urlLikePattern.test(text)) return false;
  return /^[a-z0-9_-]{2,24}$/i.test(text);
}

export function normalizeWebsiteUrl(value?: string | null) {
  return normalizeGenericUrl(value);
}

export function normalizeInstagramUrl(value?: string | null) {
  return normalizeHandleUrl(value, "https://instagram.com/");
}

export function normalizeTikTokUrl(value?: string | null) {
  return normalizeHandleUrl(value, "https://tiktok.com/@", true);
}

export function normalizeSpotifyUrl(value?: string | null) {
  return normalizeGenericUrl(value);
}

export function normalizeSpotifyPlaylistUrl(value?: string | null) {
  return normalizeGenericUrl(value);
}

export function normalizeSoundCloudUrl(value?: string | null) {
  return normalizeHandleUrl(value, "https://soundcloud.com/");
}

export function normalizeYouTubeUrl(value?: string | null) {
  return normalizeGenericUrl(value);
}

function normalizeGenericUrl(value?: string | null) {
  const text = value?.trim();
  if (!text || text === "#") return null;
  if (!isValidUrl(text)) return null;
  return text.startsWith("http://") || text.startsWith("https://") ? text : `https://${text}`;
}

function normalizeHandleUrl(value: string | null | undefined, baseUrl: string, keepAt = false) {
  const text = value?.trim();
  if (!text || text === "#") return null;
  if (isValidUrl(text)) return normalizeGenericUrl(text);

  const handle = text
    .replace(/^@/, "")
    .replace(/^\/+/, "")
    .split(/[/?#]/)[0];

  if (!/^[a-zA-Z0-9._-]{2,40}$/.test(handle)) return null;
  return `${baseUrl}${keepAt ? handle : handle}`;
}
