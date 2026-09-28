/**
 * Хугацааг секунд болгоно. Дэмжих хэлбэр: "754", "12:34", "1:02:03".
 * Хоосон бол null, буруу бол undefined буцаана.
 */
export function parseDuration(input: string | null | undefined): number | null | undefined {
  const value = (input ?? "").trim();
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);
  const match = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, h, m, s] = match;
  if (Number(s) >= 60 || (h !== undefined && Number(m) >= 60)) return undefined;
  return Number(h ?? 0) * 3600 + Number(m) * 60 + Number(s);
}

/** Засварын маягтад харуулах хэлбэр: 754 → "12:34" */
export function formatClock(totalSeconds: number | null): string {
  if (totalSeconds == null) return "";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = String(totalSeconds % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** ISO 8601 хугацааг ("PT12M34S") секунд болгоно — schema.org-д хэрэглэнэ. */
export function toIsoDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s || (!h && !m) ? `${s}S` : ""}`;
}
