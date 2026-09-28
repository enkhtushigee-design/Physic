// Админ сессийн токен: "<дуусах хугацаа ms>.<HMAC-SHA256 гарын үсэг>".
// Web Crypto ашигладаг тул proxy болон серверийн кодод адилхан ажиллана.
// V2-д Supabase Auth (хэрэглэгч + role) руу шилжүүлэхэд зөвхөн энэ модулийг солино.

export const ADMIN_COOKIE = "mp_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 цаг

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

/** Урт нь ижил эсэхээс үл хамааран тогтмол хугацаанд харьцуулна. */
export function constantTimeEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < length; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function sessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export async function createSessionToken(secret: string, now = Date.now()): Promise<string> {
  const expires = String(now + SESSION_TTL_SECONDS * 1000);
  return `${expires}.${await hmac(secret, `admin:${expires}`)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string | null, now = Date.now()): Promise<boolean> {
  if (!token || !secret) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < now) return false;
  return constantTimeEqual(signature, await hmac(secret, `admin:${expires}`));
}
