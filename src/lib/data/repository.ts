import type { ContentSnapshot, ContentTable, ContentTables } from "@/lib/content/types";

type SystemColumns = "id" | "created_at" | "updated_at";

export type InsertRow<T extends ContentTable> = Omit<ContentTables[T], SystemColumns>;
export type UpdateRow<T extends ContentTable> = Partial<InsertRow<T>>;

/**
 * Агуулгын өгөгдөлд хандах нэгдсэн интерфейс.
 * Supabase болон локал файлын хэрэгжүүлэлт хоёулаа үүнийг дагана.
 * Ахиц, тест, симуляц зэрэг шинэ өгөгдлийг нэмэхдээ тусдаа repository үүсгэнэ.
 */
export interface ContentRepository {
  readonly kind: "supabase" | "local";
  /** includeUnpublished=false үед зөвхөн нийтлэгдсэн мөрүүдийг буцаана. */
  loadAll(options: { includeUnpublished: boolean }): Promise<ContentSnapshot>;
  insert<T extends ContentTable>(table: T, row: InsertRow<T>): Promise<ContentTables[T]>;
  update<T extends ContentTable>(table: T, id: string, patch: UpdateRow<T>): Promise<ContentTables[T]>;
  remove(table: ContentTable, id: string): Promise<void>;
}

export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code?: "duplicate" | "not_found" | "not_configured" | "unknown",
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}
