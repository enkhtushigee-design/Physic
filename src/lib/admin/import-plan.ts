import type { ContentSnapshot } from "@/lib/content/types";
import { parseDuration } from "@/lib/duration";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { parseYouTubeVideoId } from "@/lib/youtube";
import { parseCsv } from "./csv";

const T = mnAdmin.import;

export const REQUIRED_COLUMNS = ["topic_title", "chapter_title", "lesson_title", "youtube_url"] as const;
export const OPTIONAL_COLUMNS = ["description", "duration_seconds", "order_index", "learning_objectives"] as const;
export const TEMPLATE_HEADER = [
  "topic_title",
  "chapter_title",
  "lesson_title",
  "description",
  "youtube_url",
  "duration_seconds",
  "order_index",
  "learning_objectives",
];
export const MAX_IMPORT_ROWS = 1000;

export type PlanRow = {
  line: number;
  topicTitle: string;
  chapterTitle: string;
  lessonTitle: string;
  description: string | null;
  videoId: string | null;
  durationSeconds: number | null;
  orderIndex: number | null;
  objectives: string[];
  status: "new" | "duplicate" | "error";
  errors: string[];
  warnings: string[];
};

export type ImportPlan = {
  /** Файлын түвшний алдаа (багана дутуу гэх мэт) */
  fileError: string | null;
  rows: PlanRow[];
  summary: { newLessons: number; newTopics: number; newChapters: number; skipped: number; errors: number };
  canCommit: boolean;
};

/** Нэрийг харьцуулахад зориулж жигдэлнэ (том жижиг үсэг, илүү зай). */
export const normalizeKey = (value: string) => value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("mn");

const emptyPlan = (fileError: string): ImportPlan => ({
  fileError,
  rows: [],
  summary: { newLessons: 0, newTopics: 0, newChapters: 0, skipped: 0, errors: 0 },
  canCommit: false,
});

export function buildImportPlan(csvText: string, existing: ContentSnapshot): ImportPlan {
  const table = parseCsv(csvText);
  if (table.length === 0) return emptyPlan(T.empty);

  const header = table[0].map((h) => h.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length > 0) return emptyPlan(T.missingColumns(missing.join(", ")));
  if (table.length === 1) return emptyPlan(T.noRows);
  if (table.length - 1 > MAX_IMPORT_ROWS) return emptyPlan(T.tooManyRows(MAX_IMPORT_ROWS));

  const col = (row: string[], name: string) => {
    const index = header.indexOf(name);
    return index === -1 ? "" : (row[index] ?? "").trim();
  };

  // Одоо байгаа агуулгын түлхүүрүүд
  const topicByKey = new Map(existing.topics.map((t) => [normalizeKey(t.title), t]));
  const chapterKeys = new Map(
    existing.chapters.map((c) => [`${c.topic_id}|${normalizeKey(c.title)}`, c]),
  );
  const topicById = new Map(existing.topics.map((t) => [t.id, t]));
  const chapterById = new Map(existing.chapters.map((c) => [c.id, c]));
  const existingLessonKeys = new Set<string>();
  for (const lesson of existing.lessons) {
    const chapter = chapterById.get(lesson.chapter_id);
    const topic = chapter && topicById.get(chapter.topic_id);
    if (topic && chapter) {
      existingLessonKeys.add(`${normalizeKey(topic.title)}|${normalizeKey(chapter.title)}|${normalizeKey(lesson.title)}`);
    }
  }
  const usedVideoIds = new Set(existing.lessons.map((l) => l.youtube_video_id).filter(Boolean));

  const seenLessonKeys = new Set<string>();
  const newTopicKeys = new Set<string>();
  const newChapterKeys = new Set<string>();

  const rows: PlanRow[] = table.slice(1).map((cells, i) => {
    const line = i + 2; // толгой мөр = 1
    const errors: string[] = [];
    const warnings: string[] = [];

    const topicTitle = col(cells, "topic_title").replace(/\s+/g, " ");
    const chapterTitle = col(cells, "chapter_title").replace(/\s+/g, " ");
    const lessonTitle = col(cells, "lesson_title").replace(/\s+/g, " ");
    if (!topicTitle) errors.push(T.rowErrors.topicTitle);
    if (!chapterTitle) errors.push(T.rowErrors.chapterTitle);
    if (!lessonTitle) errors.push(T.rowErrors.lessonTitle);
    if ([topicTitle, chapterTitle, lessonTitle].some((t) => t.length > 200)) errors.push(T.rowErrors.titleTooLong);

    const youtubeRaw = col(cells, "youtube_url");
    const videoId = youtubeRaw ? parseYouTubeVideoId(youtubeRaw) : null;
    if (youtubeRaw && !videoId) errors.push(T.rowErrors.youtube);
    if (!youtubeRaw) warnings.push(T.rowWarnings.noVideo);

    const durationSeconds = parseDuration(col(cells, "duration_seconds"));
    if (durationSeconds === undefined) errors.push(T.rowErrors.duration);

    const orderRaw = col(cells, "order_index");
    const orderIndex = orderRaw === "" ? null : /^\d+$/.test(orderRaw) && Number(orderRaw) > 0 ? Number(orderRaw) : NaN;
    if (Number.isNaN(orderIndex)) errors.push(T.rowErrors.order);

    const objectives = col(cells, "learning_objectives")
      .split("|")
      .map((o) => o.trim())
      .filter(Boolean);

    let status: PlanRow["status"] = errors.length > 0 ? "error" : "new";
    if (status === "new") {
      const tKey = normalizeKey(topicTitle);
      const cKey = normalizeKey(chapterTitle);
      const lessonKey = `${tKey}|${cKey}|${normalizeKey(lessonTitle)}`;
      if (existingLessonKeys.has(lessonKey)) {
        status = "duplicate";
        warnings.push(T.rowWarnings.duplicateExisting);
      } else if (seenLessonKeys.has(lessonKey)) {
        status = "duplicate";
        warnings.push(T.rowWarnings.duplicateInFile);
      } else if (videoId && usedVideoIds.has(videoId)) {
        status = "duplicate";
        warnings.push(T.rowWarnings.duplicateVideo);
      } else {
        seenLessonKeys.add(lessonKey);
        if (videoId) usedVideoIds.add(videoId);
        const topic = topicByKey.get(tKey);
        if (!topic) newTopicKeys.add(tKey);
        const chapterExists = topic && chapterKeys.has(`${topic.id}|${cKey}`);
        if (!chapterExists) newChapterKeys.add(`${tKey}|${cKey}`);
      }
    }

    return {
      line,
      topicTitle,
      chapterTitle,
      lessonTitle,
      description: col(cells, "description") || null,
      videoId,
      durationSeconds: durationSeconds ?? null,
      orderIndex: Number.isNaN(orderIndex) ? null : orderIndex,
      objectives,
      status,
      errors,
      warnings: status === "duplicate" ? warnings.filter((w) => w !== T.rowWarnings.noVideo) : warnings,
    };
  });

  const summary = {
    newLessons: rows.filter((r) => r.status === "new").length,
    newTopics: newTopicKeys.size,
    newChapters: newChapterKeys.size,
    skipped: rows.filter((r) => r.status === "duplicate").length,
    errors: rows.filter((r) => r.status === "error").length,
  };

  return { fileError: null, rows, summary, canCommit: summary.errors === 0 && summary.newLessons > 0 };
}
