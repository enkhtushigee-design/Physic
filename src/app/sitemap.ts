import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/content/catalog";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { topics } = await getCatalog();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/physics`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/learning-path`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const contentPages = topics.flatMap((topic) => [
    { url: `${base}${topic.href}`, lastModified: topic.updated_at, priority: 0.8 },
    ...topic.chapters.flatMap((chapter) => [
      { url: `${base}${chapter.href}`, lastModified: chapter.updated_at, priority: 0.7 },
      ...chapter.lessons.map((lesson) => ({ url: `${base}${lesson.href}`, lastModified: lesson.updated_at, priority: 0.6 })),
    ]),
  ]);

  return [...staticPages, ...contentPages];
}
