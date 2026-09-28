import "server-only";

export type DataSource = "supabase" | "local" | "unconfigured";

export function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || undefined;
}

export function supabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined;
}

export function supabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || undefined;
}

/**
 * Supabase тохируулсан бол түүнийг ашиглана.
 * Тохируулаагүй үед локал орчинд `.data/content.json` файлыг ашиглана
 * (Vercel дээр файл бичих боломжгүй тул тэнд ашиглахгүй).
 */
export function dataSource(): DataSource {
  if (supabaseUrl() && supabaseAnonKey()) return "supabase";
  if (process.env.VERCEL) return "unconfigured";
  return "local";
}
