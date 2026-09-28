import "server-only";

import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ContentSnapshot, ContentTable, ContentTables } from "@/lib/content/types";
import { RepositoryError, type ContentRepository, type UpdateRow } from "./repository";

// Зөвхөн локал хөгжүүлэлтэд зориулсан хадгалалт (Supabase-гүйгээр туршихад).
// Supabase-ийн хязгаарлалтуудын гол хэсгийг (давхардсан slug, cascade устгал) дуурайлгана.

const FILE = path.join(process.cwd(), ".data", "content.json");

const EMPTY: ContentSnapshot = { topics: [], chapters: [], lessons: [] };

async function read(): Promise<ContentSnapshot> {
  if (!existsSync(FILE)) return structuredClone(EMPTY);
  const parsed = JSON.parse(await readFile(FILE, "utf8")) as Partial<ContentSnapshot>;
  return { topics: parsed.topics ?? [], chapters: parsed.chapters ?? [], lessons: parsed.lessons ?? [] };
}

async function write(data: ContentSnapshot): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await rename(tmp, FILE);
}

// Бичих үйлдлүүдийг дараалуулж, зэрэг бичилтээс сэргийлнэ.
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => undefined);
  return next;
}

function assertUniqueSlug<T extends ContentTable>(data: ContentSnapshot, table: T, row: ContentTables[T]) {
  const clash = (data[table] as ContentTables[T][]).some((other) => {
    if (other.id === row.id || other.slug !== row.slug) return false;
    if (table === "chapters") return (other as ContentTables["chapters"]).topic_id === (row as ContentTables["chapters"]).topic_id;
    if (table === "lessons") return (other as ContentTables["lessons"]).chapter_id === (row as ContentTables["lessons"]).chapter_id;
    return true;
  });
  if (clash) throw new RepositoryError(`Duplicate slug "${row.slug}" in ${table}`, "duplicate");
}

export const localRepository: ContentRepository = {
  kind: "local",

  async loadAll({ includeUnpublished }) {
    const data = await read();
    if (includeUnpublished) return data;
    const topics = data.topics.filter((t) => t.is_published);
    const topicIds = new Set(topics.map((t) => t.id));
    const chapters = data.chapters.filter((c) => c.is_published && topicIds.has(c.topic_id));
    const chapterIds = new Set(chapters.map((c) => c.id));
    const lessons = data.lessons.filter((l) => l.is_published && chapterIds.has(l.chapter_id));
    return { topics, chapters, lessons };
  },

  insert(table, row) {
    return serialize(async () => {
      const data = await read();
      const now = new Date().toISOString();
      const created = { ...row, id: randomUUID(), created_at: now, updated_at: now } as ContentTables[typeof table];
      assertUniqueSlug(data, table, created);
      (data[table] as (typeof created)[]).push(created);
      await write(data);
      return created;
    });
  },

  update<T extends ContentTable>(table: T, id: string, patch: UpdateRow<T>) {
    return serialize(async () => {
      const data = await read();
      const rows = data[table] as ContentTables[T][];
      const index = rows.findIndex((r) => r.id === id);
      if (index === -1) throw new RepositoryError(`${table} ${id} not found`, "not_found");
      const updated = { ...rows[index], ...patch, updated_at: new Date().toISOString() } as ContentTables[T];
      assertUniqueSlug(data, table, updated);
      rows[index] = updated;
      await write(data);
      return updated;
    });
  },

  remove(table, id) {
    return serialize(async () => {
      const data = await read();
      if (table === "topics") {
        const chapterIds = new Set(data.chapters.filter((c) => c.topic_id === id).map((c) => c.id));
        data.lessons = data.lessons.filter((l) => !chapterIds.has(l.chapter_id));
        data.chapters = data.chapters.filter((c) => c.topic_id !== id);
        data.topics = data.topics.filter((t) => t.id !== id);
      } else if (table === "chapters") {
        data.lessons = data.lessons.filter((l) => l.chapter_id !== id);
        data.chapters = data.chapters.filter((c) => c.id !== id);
      } else {
        data.lessons = data.lessons.filter((l) => l.id !== id);
      }
      await write(data);
    });
  },
};
