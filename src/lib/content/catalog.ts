import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getPublicRepository } from "@/lib/data";
import { buildCatalog, flattenPath } from "./build-catalog";
import type { Catalog, Chapter, ContentSnapshot, Lesson, Topic } from "./types";

export const CATALOG_TAG = "catalog";

// Нийтлэгдсэн бүх агуулгыг нэг дор уншиж, кэшлэнэ. Хэдэн мянган хичээл хүртэл
// энэ арга хангалттай хурдан; админ өөрчлөлт хийх бүрт кэш шинэчлэгдэнэ.
const loadPublishedSnapshot = unstable_cache(
  async (): Promise<ContentSnapshot> => {
    const repository = getPublicRepository();
    if (!repository) return { topics: [], chapters: [], lessons: [] };
    return repository.loadAll({ includeUnpublished: false });
  },
  // Vercel-ийн өгөгдлийн кэш deploy хооронд хадгалагддаг тул deploy бүр шинэ кэшээр эхэлнэ
  // (жишээ нь мэдээллийн санг админаас гадуур өөрчилсний дараа redeploy хийхэд шинэчлэгдэнэ).
  ["published-content-v1", process.env.VERCEL_DEPLOYMENT_ID ?? "local"],
  { tags: [CATALOG_TAG], revalidate: 3600 },
);

export const getCatalog = cache(async (): Promise<Catalog> => buildCatalog(await loadPublishedSnapshot()));

export const getPathLessons = cache(async () => flattenPath((await getCatalog()).topics));

export async function findTopic(topicSlug: string): Promise<Topic | undefined> {
  return (await getCatalog()).topics.find((t) => t.slug === topicSlug);
}

export async function findChapter(topicSlug: string, chapterSlug: string) {
  const topic = await findTopic(topicSlug);
  const chapter = topic?.chapters.find((c) => c.slug === chapterSlug);
  return topic && chapter ? { topic, chapter } : undefined;
}

export type LessonContext = {
  topic: Topic;
  chapter: Chapter;
  lesson: Lesson;
  prev?: { title: string; href: string; chapterTitle: string };
  next?: { title: string; href: string; chapterTitle: string };
};

export async function findLesson(
  topicSlug: string,
  chapterSlug: string,
  lessonSlug: string,
): Promise<LessonContext | undefined> {
  const found = await findChapter(topicSlug, chapterSlug);
  const lesson = found?.chapter.lessons.find((l) => l.slug === lessonSlug);
  if (!found || !lesson) return undefined;

  // Өмнөх/дараагийн хичээлийг бүх суралцах замын дарааллаар тодорхойлно
  // (бүлгийн төгсгөлд дараагийн бүлгийн эхний хичээл рүү шилжинэ).
  const path = await getPathLessons();
  const index = path.findIndex((p) => p.id === lesson.id);
  const pick = (i: number) =>
    path[i] ? { title: path[i].title, href: path[i].href, chapterTitle: path[i].chapterTitle } : undefined;

  return { ...found, lesson, prev: pick(index - 1), next: pick(index + 1) };
}
