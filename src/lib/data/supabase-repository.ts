import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ContentSnapshot, ContentTable, ContentTables } from "@/lib/content/types";
import { RepositoryError, type ContentRepository } from "./repository";

const COLUMNS = {
  topics: "id,title,slug,description,order_index,thumbnail_url,is_published,created_at,updated_at",
  chapters: "id,topic_id,title,slug,description,order_index,is_published,created_at,updated_at",
  lessons:
    "id,chapter_id,title,slug,description,youtube_video_id,duration_seconds,order_index,learning_objectives,is_published,created_at,updated_at",
} as const satisfies Record<ContentTable, string>;

export function createServerClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function toRepositoryError(error: { code?: string; message: string }): RepositoryError {
  // 23505 = unique_violation (жишээ нь давхардсан slug)
  return new RepositoryError(error.message, error.code === "23505" ? "duplicate" : "unknown");
}

/**
 * Нийтийн хуудсууд anon түлхүүр ашиглана (RLS нь зөвхөн нийтлэгдсэнийг буцаана).
 * Админ хэсэг service role түлхүүр ашиглана — энэ түлхүүр зөвхөн серверт байна.
 */
export function createSupabaseRepository(client: SupabaseClient): ContentRepository {
  async function selectAll<T extends ContentTable>(table: T, includeUnpublished: boolean) {
    let query = client.from(table).select(COLUMNS[table]).order("order_index", { ascending: true });
    if (!includeUnpublished) query = query.eq("is_published", true);
    const { data, error } = await query;
    if (error) throw toRepositoryError(error);
    return (data ?? []) as unknown as ContentTables[T][];
  }

  return {
    kind: "supabase",

    async loadAll({ includeUnpublished }): Promise<ContentSnapshot> {
      const [topics, chapters, lessons] = await Promise.all([
        selectAll("topics", includeUnpublished),
        selectAll("chapters", includeUnpublished),
        selectAll("lessons", includeUnpublished),
      ]);
      return { topics, chapters, lessons };
    },

    async insert(table, row) {
      const { data, error } = await client.from(table).insert(row as never).select(COLUMNS[table]).single();
      if (error) throw toRepositoryError(error);
      return data as unknown as ContentTables[typeof table];
    },

    async update(table, id, patch) {
      const { data, error } = await client.from(table).update(patch as never).eq("id", id).select(COLUMNS[table]).single();
      if (error) throw toRepositoryError(error);
      return data as unknown as ContentTables[typeof table];
    },

    async remove(table, id) {
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) throw toRepositoryError(error);
    },
  };
}
