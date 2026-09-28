// YouTube холбоосоос видеоны ID-г аюулгүйгээр ялгаж авна.
// Мэдээллийн санд зөвхөн 11 тэмдэгтэй ID хадгалж, embed хаягийг энд бүтээнэ.
// Ингэснээр дурын iframe хаяг хуудсанд орох боломжгүй болно.

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function isValidVideoId(value: string): boolean {
  return VIDEO_ID_PATTERN.test(value);
}

/**
 * Дэмжих хэлбэрүүд:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID, /live/VIDEO_ID
 *   эсвэл шууд VIDEO_ID
 * Танигдаагүй бол null буцаана.
 */
export function parseYouTubeVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (isValidVideoId(raw)) return raw;

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);
  let candidate: string | null | undefined = null;

  if (host === "youtu.be" || host === "www.youtu.be") {
    candidate = segments[0];
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (segments[0] === "watch") {
      candidate = url.searchParams.get("v");
    } else if (["shorts", "embed", "live", "v"].includes(segments[0] ?? "")) {
      candidate = segments[1];
    }
  }

  return candidate && isValidVideoId(candidate) ? candidate : null;
}

export function youtubeEmbedUrl(videoId: string, options: { autoplay?: boolean } = {}): string {
  if (!isValidVideoId(videoId)) throw new Error("Invalid YouTube video id");
  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (options.autoplay) params.set("autoplay", "1");
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}
