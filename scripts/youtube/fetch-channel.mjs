// Reads public metadata (titles, ids, durations, playlists) of a YouTube channel.
// No video content is downloaded.
import { writeFileSync } from "node:fs";

const HANDLE = "@magsarbatkhuyag2945";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const headers = { "User-Agent": UA, "Accept-Language": "mn,en;q=0.8", Cookie: "CONSENT=YES+1; SOCS=CAI" };

import { execFileSync } from "node:child_process";

function curl(url, body) {
  const args = ["-sL", "--max-time", "60", "-A", UA, "-H", `Accept-Language: ${headers["Accept-Language"]}`, "-H", `Cookie: ${headers.Cookie}`];
  if (body) args.push("-H", "Content-Type: application/json", "--data-binary", "@-");
  return execFileSync("curl", [...args, url], { input: body ?? "", maxBuffer: 64 * 1024 * 1024 }).toString("utf8");
}
const fetch = async (url, opts = {}) => {
  const out = curl(url, opts.body);
  return { text: async () => out, json: async () => JSON.parse(out) };
};

async function page(url) {
  const html = await (await fetch(url, { headers })).text();
  const start = html.indexOf("var ytInitialData = ") + "var ytInitialData = ".length;
  const data = JSON.parse(html.slice(start, html.indexOf(";</script>", start)));
  const key = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)[1];
  const client = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)[1];
  return { data, key, client };
}

function walk(node, fn) {
  if (Array.isArray(node)) node.forEach((n) => walk(n, fn));
  else if (node && typeof node === "object") {
    fn(node);
    Object.values(node).forEach((v) => walk(v, fn));
  }
}

const text = (t) => t?.simpleText ?? t?.runs?.map((r) => r.text).join("") ?? t?.content ?? "";

async function collect(url, extract) {
  const { data, key, client } = await page(url);
  const items = [];
  let payload = data;
  const seen = new Set();
  for (let round = 0; round < 100; round++) {
    let token = null;
    walk(payload, (n) => {
      const got = extract(n);
      if (got) items.push(got);
      const c = n.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
      if (c && !token && !seen.has(c)) token = c; // эхний (жагсаалтын) continuation-ийг авна
    });
    if (!token) break;
    seen.add(token);
    const res = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${key}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion: client, hl: "mn" } }, continuation: token }),
    });
    payload = await res.json();
  }
  return items;
}

const parseClock = (s) => (s ? s.split(":").reduce((acc, p) => acc * 60 + Number(p), 0) : null);

const videoExtract = (n) => {
  const v = n.videoRenderer ?? n.playlistVideoRenderer;
  if (v?.videoId) {
    const len = text(v.lengthText) || v.lengthSeconds;
    return { id: v.videoId, title: text(v.title), duration: typeof len === "string" && len.includes(":") ? parseClock(len) : Number(len) || null, published: text(v.publishedTimeText) };
  }
  const l = n.lockupViewModel;
  if (l?.contentType === "LOCKUP_CONTENT_TYPE_VIDEO") {
    let duration = null;
    walk(l.contentImage, (m) => {
      const t = m.thumbnailBadgeViewModel?.text;
      if (t && /^\d+(:\d{2}){1,2}$/.test(t)) duration = parseClock(t);
    });
    return { id: l.contentId, title: l.metadata?.lockupMetadataViewModel?.title?.content ?? "", duration };
  }
  return null;
};

const videos = await collect(`https://www.youtube.com/${HANDLE}/videos`, videoExtract);
const shorts = await collect(`https://www.youtube.com/${HANDLE}/shorts`, (n) => {
  const s = n.shortsLockupViewModel;
  const id = s?.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
  return id ? { id, title: s.overlayMetadata?.primaryText?.content ?? "", duration: null, short: true } : null;
});
const playlists = await collect(`https://www.youtube.com/${HANDLE}/playlists`, (n) => {
  const p = n.gridPlaylistRenderer ?? n.playlistRenderer;
  if (p?.playlistId) return { id: p.playlistId, title: text(p.title) };
  const l = n.lockupViewModel;
  if (l?.contentType === "LOCKUP_CONTENT_TYPE_PLAYLIST") return { id: l.contentId, title: l.metadata?.lockupMetadataViewModel?.title?.content ?? "" };
  return null;
});

for (const pl of playlists) {
  pl.videos = (await collect(`https://www.youtube.com/playlist?list=${pl.id}`, videoExtract)).map((v) => ({ id: v.id, title: v.title, duration: v.duration }));
}

const dedupe = (arr) => [...new Map(arr.map((x) => [x.id, x])).values()];
const out = { channel: HANDLE, fetchedAt: new Date().toISOString(), videos: dedupe(videos), shorts: dedupe(shorts), playlists: dedupe(playlists) };
writeFileSync(new URL("../../content/youtube-channel.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`videos=${out.videos.length} shorts=${out.shorts.length} playlists=${out.playlists.length}`);
for (const p of out.playlists) console.log(`  PL ${p.id} (${p.videos.length}) ${p.title}`);
