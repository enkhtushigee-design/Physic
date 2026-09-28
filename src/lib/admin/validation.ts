import { parseDuration } from "@/lib/duration";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { isValidSlug } from "@/lib/slug";
import { parseYouTubeVideoId } from "@/lib/youtube";

const E = mnAdmin.errors;

export type FieldErrors = Partial<Record<string, string>>;
export type Parsed<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

type Common = {
  title: string;
  /** null бол гарчгаас автоматаар үүсгэнэ */
  slug: string | null;
  description: string | null;
  is_published: boolean;
  /** 1-ээс эхэлсэн байрлал; null бол үүсгэхэд сүүлд, засахад байрандаа үлдэнэ */
  position: number | null;
};

export type TopicInput = Common & { thumbnail_url: string | null };
export type ChapterInput = Common & { topic_id: string };
export type LessonInput = Common & {
  chapter_id: string;
  youtube_video_id: string | null;
  duration_seconds: number | null;
  learning_objectives: string[];
};

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optional(form: FormData, key: string): string | null {
  return text(form, key) || null;
}

function parseCommon(form: FormData, errors: FieldErrors): Common {
  const title = text(form, "title").replace(/\s+/g, " ");
  if (!title) errors.title = E.required;
  else if (title.length > 200) errors.title = E.titleTooLong;

  const slug = text(form, "slug").toLowerCase() || null;
  if (slug && !isValidSlug(slug)) errors.slug = E.invalidSlug;

  const rawPosition = text(form, "position");
  let position: number | null = null;
  if (rawPosition) {
    if (/^\d+$/.test(rawPosition) && Number(rawPosition) >= 1) position = Number(rawPosition);
    else errors.position = E.invalidPosition;
  }

  return {
    title,
    slug,
    description: optional(form, "description"),
    is_published: form.get("is_published") === "on",
    position,
  };
}

function result<T>(value: T, errors: FieldErrors): Parsed<T> {
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}

export function parseTopicForm(form: FormData): Parsed<TopicInput> {
  const errors: FieldErrors = {};
  const common = parseCommon(form, errors);
  const thumbnail_url = optional(form, "thumbnail_url");
  if (thumbnail_url) {
    try {
      if (new URL(thumbnail_url).protocol !== "https:") errors.thumbnail_url = E.invalidUrl;
    } catch {
      errors.thumbnail_url = E.invalidUrl;
    }
  }
  return result({ ...common, thumbnail_url }, errors);
}

export function parseChapterForm(form: FormData): Parsed<ChapterInput> {
  const errors: FieldErrors = {};
  const common = parseCommon(form, errors);
  const topic_id = text(form, "topic_id");
  if (!topic_id) errors.topic_id = E.required;
  return result({ ...common, topic_id }, errors);
}

export function parseLessonForm(form: FormData): Parsed<LessonInput> {
  const errors: FieldErrors = {};
  const common = parseCommon(form, errors);

  const chapter_id = text(form, "chapter_id");
  if (!chapter_id) errors.chapter_id = E.required;

  const youtubeRaw = text(form, "youtube");
  const youtube_video_id = youtubeRaw ? parseYouTubeVideoId(youtubeRaw) : null;
  if (youtubeRaw && !youtube_video_id) errors.youtube = E.invalidYoutube;

  const duration = parseDuration(text(form, "duration"));
  if (duration === undefined) errors.duration = E.invalidDuration;

  const learning_objectives = text(form, "learning_objectives")
    .split(/\r?\n/)
    // "- ", "• ", "1. ", "2) " зэрэг жагсаалтын тэмдгийг арилгана.
    .map((line) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);

  return result(
    { ...common, chapter_id, youtube_video_id, duration_seconds: duration ?? null, learning_objectives },
    errors,
  );
}
