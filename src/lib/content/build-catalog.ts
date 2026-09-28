import type { Catalog, Chapter, ContentSnapshot, Lesson, PathLesson, Topic } from "./types";

type Ordered = { order_index: number; created_at: string; title: string };

export function byOrder(a: Ordered, b: Ordered): number {
  return a.order_index - b.order_index || a.created_at.localeCompare(b.created_at) || a.title.localeCompare(b.title, "mn");
}

/** Хавтгай мөрүүдээс эрэмбэлсэн Сэдэв → Бүлэг → Хичээл мод бүтээнэ. */
export function buildCatalog(snapshot: ContentSnapshot): Catalog {
  const lessonsByChapter = new Map<string, typeof snapshot.lessons>();
  for (const lesson of snapshot.lessons) {
    const list = lessonsByChapter.get(lesson.chapter_id) ?? [];
    list.push(lesson);
    lessonsByChapter.set(lesson.chapter_id, list);
  }
  const chaptersByTopic = new Map<string, typeof snapshot.chapters>();
  for (const chapter of snapshot.chapters) {
    const list = chaptersByTopic.get(chapter.topic_id) ?? [];
    list.push(chapter);
    chaptersByTopic.set(chapter.topic_id, list);
  }

  const topics: Topic[] = [...snapshot.topics].sort(byOrder).map((topicRow, topicIndex) => {
    const topicHref = `/${topicRow.slug}`;
    const chapters: Chapter[] = [...(chaptersByTopic.get(topicRow.id) ?? [])]
      .sort(byOrder)
      .map((chapterRow, chapterIndex) => {
        const chapterHref = `${topicHref}/${chapterRow.slug}`;
        const lessons: Lesson[] = [...(lessonsByChapter.get(chapterRow.id) ?? [])]
          .sort(byOrder)
          .map((lessonRow, lessonIndex) => ({
            ...lessonRow,
            number: lessonIndex + 1,
            href: `${chapterHref}/${lessonRow.slug}`,
          }));
        return {
          ...chapterRow,
          number: chapterIndex + 1,
          href: chapterHref,
          lessons,
          totalDurationSeconds: lessons.reduce((sum, l) => sum + (l.duration_seconds ?? 0), 0),
        };
      });
    return {
      ...topicRow,
      number: topicIndex + 1,
      href: topicHref,
      chapters,
      lessonCount: chapters.reduce((sum, c) => sum + c.lessons.length, 0),
    };
  });

  return { topics };
}

/** Бүх хичээлийг суралцах замын дарааллаар нь хавтгай жагсаалт болгоно. */
export function flattenPath(topics: Topic[]): PathLesson[] {
  return topics.flatMap((topic) =>
    topic.chapters.flatMap((chapter) =>
      chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        href: lesson.href,
        chapterTitle: chapter.title,
        topicTitle: topic.title,
      })),
    ),
  );
}

export function lessonIdsOf(item: Topic | Chapter): string[] {
  return "lessons" in item ? item.lessons.map((l) => l.id) : item.chapters.flatMap((c) => c.lessons.map((l) => l.id));
}
