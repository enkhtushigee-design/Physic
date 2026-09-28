export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Албан ёсны YouTube сувгийн холбоос — тохируулсан үед л хөл хэсэгт харагдана. */
export function youtubeChannelUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    const ok = url.protocol === "https:" && /(^|\.)youtube\.com$/.test(url.hostname);
    return ok ? url.toString() : null;
  } catch {
    return null;
  }
}

export const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/physics", key: "topics" },
  { href: "/learning-path", key: "path" },
  { href: "/search", key: "search" },
] as const;
