import { beforeEach, describe, expect, it } from "vitest";
import { buildCatalog, flattenPath } from "@/lib/content/build-catalog";
import { searchCatalog } from "@/lib/content/search";
import type { ContentSnapshot, ContentTable, ContentTables } from "@/lib/content/types";
import { RepositoryError, type ContentRepository } from "@/lib/data/repository";
import {
  createChapter,
  createLesson,
  createTopic,
  deleteChapter,
  deleteTopic,
  executeImport,
  moveItem,
  ServiceError,
  updateChapter,
  updateLesson,
} from "./content-service";
import { buildImportPlan } from "./import-plan";
import type { ChapterInput, LessonInput, TopicInput } from "./validation";

// Санах ойд ажилладаг repository (Supabase-ийн unique болон cascade дүрмийг дуурайлгана).
function memoryRepository(): ContentRepository & { data: ContentSnapshot } {
  const data: ContentSnapshot = { topics: [], chapters: [], lessons: [] };
  let seq = 0;
  let clock = 0;
  const parentKey = (table: ContentTable, row: Record<string, unknown>) =>
    table === "chapters" ? row.topic_id : table === "lessons" ? row.chapter_id : "root";
  const checkUnique = (table: ContentTable, row: ContentTables[ContentTable]) => {
    const rows = data[table] as ContentTables[ContentTable][];
    if (rows.some((r) => r.id !== row.id && r.slug === row.slug && parentKey(table, r) === parentKey(table, row))) {
      throw new RepositoryError("duplicate", "duplicate");
    }
  };
  return {
    kind: "local",
    data,
    async loadAll() {
      return structuredClone(data);
    },
    async insert(table, row) {
      const now = new Date(Date.UTC(2026, 0, 1, 0, 0, clock++)).toISOString();
      const created = { ...row, id: `${table}-${++seq}`, created_at: now, updated_at: now } as ContentTables[typeof table];
      checkUnique(table, created);
      (data[table] as unknown[]).push(created);
      return structuredClone(created);
    },
    async update(table, id, patch) {
      const rows = data[table] as ContentTables[typeof table][];
      const index = rows.findIndex((r) => r.id === id);
      if (index === -1) throw new RepositoryError("missing", "not_found");
      const next = { ...rows[index], ...patch };
      checkUnique(table, next);
      rows[index] = next;
      return structuredClone(next);
    },
    async remove(table, id) {
      if (table === "topics") {
        const chapterIds = data.chapters.filter((c) => c.topic_id === id).map((c) => c.id);
        data.lessons = data.lessons.filter((l) => !chapterIds.includes(l.chapter_id));
        data.chapters = data.chapters.filter((c) => c.topic_id !== id);
      }
      if (table === "chapters") data.lessons = data.lessons.filter((l) => l.chapter_id !== id);
      (data as Record<string, { id: string }[]>)[table] = data[table].filter((r) => r.id !== id);
    },
  };
}

const topicInput = (title: string, extra: Partial<TopicInput> = {}): TopicInput => ({
  title,
  slug: null,
  description: null,
  thumbnail_url: null,
  is_published: true,
  position: null,
  ...extra,
});
const chapterInput = (topic_id: string, title: string, extra: Partial<ChapterInput> = {}): ChapterInput => ({
  topic_id,
  title,
  slug: null,
  description: null,
  is_published: true,
  position: null,
  ...extra,
});
const lessonInput = (chapter_id: string, title: string, extra: Partial<LessonInput> = {}): LessonInput => ({
  chapter_id,
  title,
  slug: null,
  description: null,
  youtube_video_id: null,
  duration_seconds: null,
  learning_objectives: [],
  is_published: true,
  position: null,
  ...extra,
});

const titles = (rows: { title: string; order_index: number }[]) =>
  [...rows].sort((a, b) => a.order_index - b.order_index).map((r) => r.title);

describe("content service", () => {
  let repo: ReturnType<typeof memoryRepository>;
  beforeEach(() => {
    repo = memoryRepository();
  });

  it("creates topics with auto slugs and explicit ordering", async () => {
    const a = await createTopic(repo, topicInput("Механик"));
    await createTopic(repo, topicInput("Оптик"));
    await createTopic(repo, topicInput("Цахилгаан", { position: 1 }));
    expect(a.slug).toBe("mekhanik");
    expect(titles(repo.data.topics)).toEqual(["Цахилгаан", "Механик", "Оптик"]);
    expect(repo.data.topics.map((t) => t.order_index).sort()).toEqual([1, 2, 3]);
  });

  it("rejects reserved and duplicate slugs with Mongolian field errors", async () => {
    await expect(createTopic(repo, topicInput("Хайлт", { slug: "search" }))).rejects.toMatchObject({
      fieldErrors: { slug: expect.stringContaining("сайт өөрөө") },
    });
    await createTopic(repo, topicInput("Механик", { slug: "mechanics" }));
    await expect(createTopic(repo, topicInput("Өөр", { slug: "mechanics" }))).rejects.toBeInstanceOf(ServiceError);
    // Автомат slug давхцвал дугаар залгана
    const second = await createTopic(repo, topicInput("Механик"));
    const third = await createTopic(repo, topicInput("Механик"));
    expect([second.slug, third.slug]).toEqual(["mekhanik", "mekhanik-2"]);
  });

  it("reorders lessons and moves a lesson to another chapter", async () => {
    const topic = await createTopic(repo, topicInput("Механик"));
    const kin = await createChapter(repo, chapterInput(topic.id, "Кинематик"));
    const dyn = await createChapter(repo, chapterInput(topic.id, "Динамик"));
    const l1 = await createLesson(repo, lessonInput(kin.id, "Шилжилт"));
    const l2 = await createLesson(repo, lessonInput(kin.id, "Хурд"));
    await createLesson(repo, lessonInput(kin.id, "Хурдатгал"));
    await createLesson(repo, lessonInput(dyn.id, "Ньютоны нэгдүгээр хууль"));

    await moveItem(repo, "lessons", l2.id, -1);
    expect(titles(repo.data.lessons.filter((l) => l.chapter_id === kin.id))).toEqual(["Хурд", "Шилжилт", "Хурдатгал"]);

    await updateLesson(repo, l1.id, lessonInput(dyn.id, "Шилжилт", { position: 1 }));
    expect(titles(repo.data.lessons.filter((l) => l.chapter_id === kin.id))).toEqual(["Хурд", "Хурдатгал"]);
    expect(titles(repo.data.lessons.filter((l) => l.chapter_id === dyn.id))).toEqual(["Шилжилт", "Ньютоны нэгдүгээр хууль"]);
    // Эх бүлгийн дугаарлалт цоорхойгүй
    expect(repo.data.lessons.filter((l) => l.chapter_id === kin.id).map((l) => l.order_index).sort()).toEqual([1, 2]);
  });

  it("moves a chapter to another topic, resolving slug clashes", async () => {
    const mech = await createTopic(repo, topicInput("Механик"));
    const waves = await createTopic(repo, topicInput("Долгион"));
    const a = await createChapter(repo, chapterInput(mech.id, "Хэлбэлзэл"));
    await createChapter(repo, chapterInput(waves.id, "Хэлбэлзэл"));
    const moved = await updateChapter(repo, a.id, chapterInput(waves.id, "Хэлбэлзэл"));
    expect(moved.topic_id).toBe(waves.id);
    expect(moved.slug).toBe("khelbelzel-2");
  });

  it("cascades deletes and closes ordering gaps", async () => {
    const t1 = await createTopic(repo, topicInput("A"));
    const t2 = await createTopic(repo, topicInput("B"));
    await createTopic(repo, topicInput("C"));
    const c = await createChapter(repo, chapterInput(t1.id, "Бүлэг"));
    await createLesson(repo, lessonInput(c.id, "Хичээл"));
    await deleteTopic(repo, t1.id);
    expect(repo.data.lessons).toHaveLength(0);
    expect(titles(repo.data.topics)).toEqual(["B", "C"]);
    expect(repo.data.topics.find((t) => t.id === t2.id)?.order_index).toBe(1);

    const c2 = await createChapter(repo, chapterInput(t2.id, "X"));
    await createChapter(repo, chapterInput(t2.id, "Y"));
    await deleteChapter(repo, c2.id);
    expect(repo.data.chapters.map((ch) => ch.order_index)).toEqual([1]);
  });
});

describe("CSV import", () => {
  const header = "topic_title,chapter_title,lesson_title,description,youtube_url,duration_seconds,order_index,learning_objectives";
  const V1 = "AAAAAAAAAA1";
  const V2 = "AAAAAAAAAA2";
  const V3 = "AAAAAAAAAA3";

  it("validates rows and reports Mongolian errors", async () => {
    const csv = [
      header,
      `Механик,Кинематик,Хурд,,https://youtu.be/${V1},12:00,2,`,
      `Механик,Кинематик,Шилжилт,"Тайлбар, таслалтай",https://www.youtube.com/watch?v=${V2},600,1,Шилжилтийг тодорхойлох|Замтай ялгах`,
      `Механик,Кинематик,Буруу,,https://vimeo.com/123,,,`,
      `Механик,,Нэргүй бүлэг,,,,,`,
      `Механик,Кинематик,Хурд,,https://youtu.be/${V3},,,`,
    ].join("\n");
    const plan = buildImportPlan(csv, { topics: [], chapters: [], lessons: [] });
    expect(plan.fileError).toBeNull();
    expect(plan.rows.map((r) => r.status)).toEqual(["new", "new", "error", "error", "duplicate"]);
    expect(plan.rows[2].errors).toContain("YouTube холбоос буруу байна.");
    expect(plan.rows[3].errors).toContain("Бүлгийн нэр хоосон байна.");
    expect(plan.summary).toMatchObject({ newLessons: 2, newTopics: 1, newChapters: 1, skipped: 1, errors: 2 });
    expect(plan.canCommit).toBe(false);
  });

  it("reports missing columns", () => {
    const plan = buildImportPlan("topic_title,lesson_title\nA,B", { topics: [], chapters: [], lessons: [] });
    expect(plan.fileError).toBe("Дараах багана дутуу байна: chapter_title, youtube_url.");
  });

  it("imports in the right order and skips existing duplicates on re-import", async () => {
    const repo = memoryRepository();
    const csv = [
      header,
      `Механик,Кинематик,Хурд,,https://youtu.be/${V1},720,2,`,
      `Механик,Динамик,Хүч,,,,,`,
      `Механик,Кинематик,Шилжилт,,${V2},600,1,Нэг|Хоёр`,
      `Оптик,Гэрэл,Тусгал,,,,,`,
    ].join("\n");
    const plan = buildImportPlan(csv, await repo.loadAll({ includeUnpublished: true }));
    expect(plan.canCommit).toBe(true);
    const result = await executeImport(repo, plan);
    expect(result).toEqual({ lessons: 4, topics: 2, chapters: 3, skipped: 0 });

    const catalog = buildCatalog(repo.data);
    expect(catalog.topics.map((t) => t.title)).toEqual(["Механик", "Оптик"]);
    expect(catalog.topics[0].chapters.map((c) => c.title)).toEqual(["Кинематик", "Динамик"]);
    expect(catalog.topics[0].chapters[0].lessons.map((l) => [l.number, l.title])).toEqual([
      [1, "Шилжилт"],
      [2, "Хурд"],
    ]);
    expect(catalog.topics[0].chapters[0].lessons[0].learning_objectives).toEqual(["Нэг", "Хоёр"]);
    expect(catalog.topics[0].chapters[0].lessons[0].href).toBe("/mekhanik/kinematik/shiljilt");
    expect(flattenPath(catalog.topics).map((p) => p.title)).toEqual(["Шилжилт", "Хурд", "Хүч", "Тусгал"]);

    // Дахин оруулахад бүгд давхардсан гэж алгасагдана
    const again = buildImportPlan(csv, await repo.loadAll({ includeUnpublished: true }));
    expect(again.summary).toMatchObject({ newLessons: 0, skipped: 4 });
    expect(again.canCommit).toBe(false);
  });
});

describe("search", () => {
  it("finds lessons by Mongolian words, folding ө/ү and case", async () => {
    const repo = memoryRepository();
    const topic = await createTopic(repo, topicInput("Механик", { description: "Биеийн хөдөлгөөн, хүч." }));
    const ch = await createChapter(repo, chapterInput(topic.id, "Динамик"));
    await createLesson(repo, lessonInput(ch.id, "Ньютоны хоёрдугаар хууль", { description: "Хүч, масс, хурдатгалын хамаарал." }));
    await createLesson(repo, lessonInput(ch.id, "Үрэлтийн хүч"));
    const catalog = buildCatalog(repo.data);

    const newton = searchCatalog(catalog, "ньютон");
    expect(newton).toHaveLength(1);
    expect(newton[0]).toMatchObject({ kind: "lesson", context: ["Механик", "Динамик"] });
    expect(newton[0].title.find((s) => s.match)?.text).toBe("Ньютон");

    expect(searchCatalog(catalog, "ХӨДӨЛГӨӨН").map((r) => r.kind)).toEqual(["topic"]);
    expect(searchCatalog(catalog, "ходолгоон")).toHaveLength(1); // ө → о
    expect(searchCatalog(catalog, "урэлт")[0].kind).toBe("lesson"); // ү → у
    expect(searchCatalog(catalog, "хүч масс")).toHaveLength(1); // бүх үг таарах ёстой
    expect(searchCatalog(catalog, "   ")).toEqual([]);
  });
});
