import "server-only";

import { buildCatalog } from "@/lib/content/build-catalog";
import type { Catalog, ContentSnapshot } from "@/lib/content/types";
import { getAdminRepository, RepositoryError } from "@/lib/data";

export type AdminData =
  | { ok: true; snapshot: ContentSnapshot; catalog: Catalog; source: "supabase" | "local" }
  | { ok: false; reason: "not_configured" | "failed" };

/** Админд зориулж ноорог мөрүүдийг оролцуулан кэшгүйгээр уншина. */
export async function loadAdminData(): Promise<AdminData> {
  try {
    const repo = getAdminRepository();
    const snapshot = await repo.loadAll({ includeUnpublished: true });
    return { ok: true, snapshot, catalog: buildCatalog(snapshot), source: repo.kind };
  } catch (error) {
    if (error instanceof RepositoryError && error.code === "not_configured") return { ok: false, reason: "not_configured" };
    console.error(error);
    return { ok: false, reason: "failed" };
  }
}
