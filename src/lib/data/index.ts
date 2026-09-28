import "server-only";

import { dataSource, supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from "./config";
import { localRepository } from "./local-repository";
import { RepositoryError, type ContentRepository } from "./repository";
import { createServerClient, createSupabaseRepository } from "./supabase-repository";

export { dataSource } from "./config";
export { RepositoryError } from "./repository";
export type { ContentRepository, InsertRow, UpdateRow } from "./repository";

/** Нийтийн хуудсуудад зориулсан, зөвхөн унших эрхтэй repository. */
export function getPublicRepository(): ContentRepository | null {
  switch (dataSource()) {
    case "supabase":
      return createSupabaseRepository(createServerClient(supabaseUrl()!, supabaseAnonKey()!));
    case "local":
      return localRepository;
    default:
      return null;
  }
}

/** Админ хэсэгт зориулсан, бичих эрхтэй repository. Зөвхөн серверт ажиллана. */
export function getAdminRepository(): ContentRepository {
  switch (dataSource()) {
    case "supabase": {
      const key = supabaseServiceRoleKey();
      if (!key) throw new RepositoryError("SUPABASE_SERVICE_ROLE_KEY is not set", "not_configured");
      return createSupabaseRepository(createServerClient(supabaseUrl()!, key));
    }
    case "local":
      return localRepository;
    default:
      throw new RepositoryError("Supabase is not configured", "not_configured");
  }
}
