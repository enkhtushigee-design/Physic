// Мэдээллийн сангийн мөрүүд (supabase/migrations-тай ижил бүтэцтэй).

export type TopicRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ChapterRow = {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type LessonRow = {
  id: string;
  chapter_id: string;
  title: string;
  slug: string;
  description: string | null;
  youtube_video_id: string | null;
  duration_seconds: number | null;
  order_index: number;
  learning_objectives: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ContentTables = {
  topics: TopicRow;
  chapters: ChapterRow;
  lessons: LessonRow;
};
export type ContentTable = keyof ContentTables;

/** Мэдээллийн сангаас уншсан бүх агуулга (эрэмбэлээгүй). */
export type ContentSnapshot = {
  topics: TopicRow[];
  chapters: ChapterRow[];
  lessons: LessonRow[];
};

// ---------------------------------------------------------------------------
// Хуудсанд ашиглах эрэмбэлсэн мод бүтэц
// ---------------------------------------------------------------------------

export type Lesson = LessonRow & {
  /** Бүлэг доторх дугаар (1-ээс эхэлнэ). */
  number: number;
  href: string;
};

export type Chapter = ChapterRow & {
  number: number;
  href: string;
  lessons: Lesson[];
  totalDurationSeconds: number;
};

export type Topic = TopicRow & {
  number: number;
  href: string;
  chapters: Chapter[];
  lessonCount: number;
};

export type Catalog = {
  topics: Topic[];
};

/** Суралцах замын дагуу эрэмбэлсэн хичээлийн товч мэдээлэл (клиент талд дамжуулна). */
export type PathLesson = {
  id: string;
  title: string;
  href: string;
  chapterTitle: string;
  topicTitle: string;
};
