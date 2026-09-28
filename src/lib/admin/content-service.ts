import type { ContentRepository } from "@/lib/data/repository";
import { RepositoryError } from "@/lib/data/repository";
import type { ContentSnapshot, ContentTable } from "@/lib/content/types";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { RESERVED_TOPIC_SLUGS, slugify, uniqueSlug } from "@/lib/slug";
import { normalizeKey, type ImportPlan } from "./import-plan";
import { closeGap, placeAt, positionOf, shift, type OrderUpdate } from "./ordering";
import type { ChapterInput, FieldErrors, LessonInput, TopicInput } from "./validation";

const E = mnAdmin.errors;

/** Хэрэглэгчид харуулах алдаа (талбарын эсвэл ерөнхий). */
export class ServiceError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

const FALLBACK_SLUG: Record<ContentTable, string> = { topics: "sedev", chapters: "buleg", lessons: "hicheel" };

function resolveSlug(table: ContentTable, requested: string | null, title: string, taken: string[]): string {
  const reserved = table === "topics" ? [...RESERVED_TOPIC_SLUGS] : [];
  if (requested) {
    if (reserved.includes(requested)) throw new ServiceError(E.fixErrors, { slug: E.reservedSlug });
    if (taken.includes(requested)) throw new ServiceError(E.fixErrors, { slug: E.duplicateSlug });
    return requested;
  }
  return uniqueSlug(slugify(title), [...taken, ...reserved], FALLBACK_SLUG[table]);
}

async function applyOrder(repo: ContentRepository, table: ContentTable, updates: OrderUpdate[]) {
  for (const u of updates) await repo.update(table, u.id, { order_index: u.order_index });
}

/** Давхардсан slug-ийн алдааг (зэрэг бичилтээс) талбарын алдаа болгоно. */
async function guard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof RepositoryError && error.code === "duplicate") {
      throw new ServiceError(E.fixErrors, { slug: E.duplicateSlug });
    }
    throw error;
  }
}

const load = (repo: ContentRepository) => repo.loadAll({ includeUnpublished: true });

function nextOrder(items: { order_index: number }[]): number {
  return items.reduce((max, i) => Math.max(max, i.order_index), 0) + 1;
}

// ---------------------------------------------------------------------------
// Сэдэв
// ---------------------------------------------------------------------------

export async function createTopic(repo: ContentRepository, input: TopicInput) {
  const snap = await load(repo);
  const slug = resolveSlug("topics", input.slug, input.title, snap.topics.map((t) => t.slug));
  const row = await guard(() =>
    repo.insert("topics", {
      title: input.title,
      slug,
      description: input.description,
      thumbnail_url: input.thumbnail_url,
      is_published: input.is_published,
      order_index: nextOrder(snap.topics),
    }),
  );
  await applyOrder(repo, "topics", placeAt([...snap.topics, row], row.id, input.position));
  return row;
}

export async function updateTopic(repo: ContentRepository, id: string, input: TopicInput) {
  const snap = await load(repo);
  const current = snap.topics.find((t) => t.id === id);
  if (!current) throw new ServiceError(E.notFound);
  const others = snap.topics.filter((t) => t.id !== id).map((t) => t.slug);
  const slug = input.slug ?? current.slug;
  const resolved = slug === current.slug ? slug : resolveSlug("topics", slug, input.title, others);
  const row = await guard(() =>
    repo.update("topics", id, {
      title: input.title,
      slug: resolved,
      description: input.description,
      thumbnail_url: input.thumbnail_url,
      is_published: input.is_published,
    }),
  );
  await applyOrder(repo, "topics", placeAt(snap.topics, id, input.position ?? positionOf(snap.topics, id)));
  return row;
}

export async function deleteTopic(repo: ContentRepository, id: string) {
  const snap = await load(repo);
  if (!snap.topics.some((t) => t.id === id)) throw new ServiceError(E.notFound);
  await repo.remove("topics", id);
  await applyOrder(repo, "topics", closeGap(snap.topics, id));
}

// ---------------------------------------------------------------------------
// Бүлэг
// ---------------------------------------------------------------------------

export async function createChapter(repo: ContentRepository, input: ChapterInput) {
  const snap = await load(repo);
  if (!snap.topics.some((t) => t.id === input.topic_id)) throw new ServiceError(E.fixErrors, { topic_id: E.parentMissing });
  const siblings = snap.chapters.filter((c) => c.topic_id === input.topic_id);
  const slug = resolveSlug("chapters", input.slug, input.title, siblings.map((c) => c.slug));
  const row = await guard(() =>
    repo.insert("chapters", {
      topic_id: input.topic_id,
      title: input.title,
      slug,
      description: input.description,
      is_published: input.is_published,
      order_index: nextOrder(siblings),
    }),
  );
  await applyOrder(repo, "chapters", placeAt([...siblings, row], row.id, input.position));
  return row;
}

export async function updateChapter(repo: ContentRepository, id: string, input: ChapterInput) {
  const snap = await load(repo);
  const current = snap.chapters.find((c) => c.id === id);
  if (!current) throw new ServiceError(E.notFound);
  if (!snap.topics.some((t) => t.id === input.topic_id)) throw new ServiceError(E.fixErrors, { topic_id: E.parentMissing });

  const moving = input.topic_id !== current.topic_id;
  const oldSiblings = snap.chapters.filter((c) => c.topic_id === current.topic_id);
  const newSiblings = snap.chapters.filter((c) => c.topic_id === input.topic_id && c.id !== id);
  const slug = input.slug ?? current.slug;
  const keepSlug = !moving && slug === current.slug;
  const resolved = keepSlug
    ? slug
    : input.slug
      ? resolveSlug("chapters", input.slug, input.title, newSiblings.map((c) => c.slug))
      : uniqueSlug(current.slug, newSiblings.map((c) => c.slug));

  const row = await guard(() =>
    repo.update("chapters", id, {
      topic_id: input.topic_id,
      title: input.title,
      slug: resolved,
      description: input.description,
      is_published: input.is_published,
    }),
  );
  if (moving) {
    await applyOrder(repo, "chapters", closeGap(oldSiblings, id));
    await applyOrder(repo, "chapters", placeAt([...newSiblings, row], id, input.position));
  } else {
    await applyOrder(repo, "chapters", placeAt(oldSiblings, id, input.position ?? positionOf(oldSiblings, id)));
  }
  return row;
}

export async function deleteChapter(repo: ContentRepository, id: string) {
  const snap = await load(repo);
  const current = snap.chapters.find((c) => c.id === id);
  if (!current) throw new ServiceError(E.notFound);
  await repo.remove("chapters", id);
  await applyOrder(repo, "chapters", closeGap(snap.chapters.filter((c) => c.topic_id === current.topic_id), id));
}

// ---------------------------------------------------------------------------
// Хичээл
// ---------------------------------------------------------------------------

export async function createLesson(repo: ContentRepository, input: LessonInput) {
  const snap = await load(repo);
  if (!snap.chapters.some((c) => c.id === input.chapter_id)) throw new ServiceError(E.fixErrors, { chapter_id: E.parentMissing });
  const siblings = snap.lessons.filter((l) => l.chapter_id === input.chapter_id);
  const slug = resolveSlug("lessons", input.slug, input.title, siblings.map((l) => l.slug));
  const row = await guard(() =>
    repo.insert("lessons", {
      chapter_id: input.chapter_id,
      title: input.title,
      slug,
      description: input.description,
      youtube_video_id: input.youtube_video_id,
      duration_seconds: input.duration_seconds,
      learning_objectives: input.learning_objectives,
      is_published: input.is_published,
      order_index: nextOrder(siblings),
    }),
  );
  await applyOrder(repo, "lessons", placeAt([...siblings, row], row.id, input.position));
  return row;
}

export async function updateLesson(repo: ContentRepository, id: string, input: LessonInput) {
  const snap = await load(repo);
  const current = snap.lessons.find((l) => l.id === id);
  if (!current) throw new ServiceError(E.notFound);
  if (!snap.chapters.some((c) => c.id === input.chapter_id)) throw new ServiceError(E.fixErrors, { chapter_id: E.parentMissing });

  const moving = input.chapter_id !== current.chapter_id;
  const oldSiblings = snap.lessons.filter((l) => l.chapter_id === current.chapter_id);
  const newSiblings = snap.lessons.filter((l) => l.chapter_id === input.chapter_id && l.id !== id);
  const slug = input.slug ?? current.slug;
  const keepSlug = !moving && slug === current.slug;
  const resolved = keepSlug
    ? slug
    : input.slug
      ? resolveSlug("lessons", input.slug, input.title, newSiblings.map((l) => l.slug))
      : uniqueSlug(current.slug, newSiblings.map((l) => l.slug));

  const row = await guard(() =>
    repo.update("lessons", id, {
      chapter_id: input.chapter_id,
      title: input.title,
      slug: resolved,
      description: input.description,
      youtube_video_id: input.youtube_video_id,
      duration_seconds: input.duration_seconds,
      learning_objectives: input.learning_objectives,
      is_published: input.is_published,
    }),
  );
  if (moving) {
    await applyOrder(repo, "lessons", closeGap(oldSiblings, id));
    await applyOrder(repo, "lessons", placeAt([...newSiblings, row], id, input.position));
  } else {
    await applyOrder(repo, "lessons", placeAt(oldSiblings, id, input.position ?? positionOf(oldSiblings, id)));
  }
  return row;
}

export async function deleteLesson(repo: ContentRepository, id: string) {
  const snap = await load(repo);
  const current = snap.lessons.find((l) => l.id === id);
  if (!current) throw new ServiceError(E.notFound);
  await repo.remove("lessons", id);
  await applyOrder(repo, "lessons", closeGap(snap.lessons.filter((l) => l.chapter_id === current.chapter_id), id));
}

// ---------------------------------------------------------------------------
// Дээш/доош зөөх
// ---------------------------------------------------------------------------

export async function moveItem(repo: ContentRepository, table: ContentTable, id: string, direction: -1 | 1) {
  const snap = await load(repo);
  const siblings = siblingsOf(snap, table, id);
  if (!siblings) throw new ServiceError(E.notFound);
  await applyOrder(repo, table, shift(siblings, id, direction));
}

type OrderableRow = { id: string; order_index: number; created_at: string; title: string };

function siblingsOf(snap: ContentSnapshot, table: ContentTable, id: string): OrderableRow[] | null {
  if (table === "topics") return snap.topics.some((t) => t.id === id) ? snap.topics : null;
  if (table === "chapters") {
    const item = snap.chapters.find((c) => c.id === id);
    return item ? snap.chapters.filter((c) => c.topic_id === item.topic_id) : null;
  }
  const item = snap.lessons.find((l) => l.id === id);
  return item ? snap.lessons.filter((l) => l.chapter_id === item.chapter_id) : null;
}

// ---------------------------------------------------------------------------
// CSV импорт
// ---------------------------------------------------------------------------

export type ImportResult = { lessons: number; topics: number; chapters: number; skipped: number };

/**
 * Шалгасан төлөвлөгөөг хэрэгжүүлнэ. Шинэ сэдэв, бүлгийг файлд анх гарсан
 * дарааллаар нь одоо байгаагийн араас нэмнэ. Хичээлүүдийг order_index (байвал),
 * эсвэл файлын дарааллаар бүлэг бүрийн төгсгөлд нэмнэ.
 */
export async function executeImport(repo: ContentRepository, plan: ImportPlan): Promise<ImportResult> {
  const snap = await load(repo);
  const rows = plan.rows.filter((r) => r.status === "new");
  const result: ImportResult = { lessons: 0, topics: 0, chapters: 0, skipped: plan.summary.skipped };

  const topics = new Map(snap.topics.map((t) => [normalizeKey(t.title), t]));
  const chapters = new Map(snap.chapters.map((c) => [`${c.topic_id}|${normalizeKey(c.title)}`, c]));
  const lessonsByChapter = new Map<string, typeof snap.lessons>();
  for (const l of snap.lessons) lessonsByChapter.set(l.chapter_id, [...(lessonsByChapter.get(l.chapter_id) ?? []), l]);

  // Мөрүүдийг бүлгээр нь (файлд анх гарсан дарааллаар) бүлэглээд,
  // бүлэг дотор order_index, дараа нь файлын дарааллаар эрэмбэлнэ.
  const groups = new Map<string, { row: (typeof rows)[number]; fileIndex: number }[]>();
  rows.forEach((row, fileIndex) => {
    const key = `${normalizeKey(row.topicTitle)}|${normalizeKey(row.chapterTitle)}`;
    groups.set(key, [...(groups.get(key) ?? []), { row, fileIndex }]);
  });
  const ordered = [...groups.values()].flatMap((group) =>
    group
      .sort((a, b) => (a.row.orderIndex ?? Infinity) - (b.row.orderIndex ?? Infinity) || a.fileIndex - b.fileIndex)
      .map((x) => x.row),
  );

  try {
    for (const row of ordered) {
      const tKey = normalizeKey(row.topicTitle);
      let topic = topics.get(tKey);
      if (!topic) {
        const all = [...topics.values()];
        topic = await repo.insert("topics", {
          title: row.topicTitle,
          slug: resolveSlug("topics", null, row.topicTitle, all.map((t) => t.slug)),
          description: null,
          thumbnail_url: null,
          is_published: true,
          order_index: nextOrder(all),
        });
        topics.set(tKey, topic);
        result.topics++;
      }

      const cKey = `${topic.id}|${normalizeKey(row.chapterTitle)}`;
      let chapter = chapters.get(cKey);
      if (!chapter) {
        const siblings = [...chapters.values()].filter((c) => c.topic_id === topic!.id);
        chapter = await repo.insert("chapters", {
          topic_id: topic.id,
          title: row.chapterTitle,
          slug: resolveSlug("chapters", null, row.chapterTitle, siblings.map((c) => c.slug)),
          description: null,
          is_published: true,
          order_index: nextOrder(siblings),
        });
        chapters.set(cKey, chapter);
        result.chapters++;
      }

      const siblings = lessonsByChapter.get(chapter.id) ?? [];
      const lesson = await repo.insert("lessons", {
        chapter_id: chapter.id,
        title: row.lessonTitle,
        slug: resolveSlug("lessons", null, row.lessonTitle, siblings.map((l) => l.slug)),
        description: row.description,
        youtube_video_id: row.videoId,
        duration_seconds: row.durationSeconds,
        learning_objectives: row.objectives,
        is_published: true,
        order_index: nextOrder(siblings),
      });
      lessonsByChapter.set(chapter.id, [...siblings, lesson]);
      result.lessons++;
    }
  } catch (error) {
    console.error("CSV import failed", error);
    throw new ServiceError(result.lessons > 0 ? mnAdmin.import.partialFailure(result.lessons) : E.generic);
  }
  return result;
}
