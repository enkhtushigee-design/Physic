import "server-only";

import { notFound } from "next/navigation";
import type { ContentSnapshot } from "@/lib/content/types";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { loadAdminData } from "./load";
import { positionOf } from "./ordering";

/** Засварын хуудсуудад хэрэгтэй өгөгдөл. Мэдээллийн сан тохируулаагүй бол алдаа шидэхгүйгээр мэдэгдэнэ. */
export async function requireSnapshot(): Promise<ContentSnapshot> {
  const data = await loadAdminData();
  if (!data.ok) throw new Error(mnAdmin.errors.notConfigured);
  return data.snapshot;
}

export function topicOptions(snap: ContentSnapshot) {
  return [...snap.topics].sort((a, b) => a.order_index - b.order_index).map((t) => ({ id: t.id, title: t.title }));
}

export function chapterGroups(snap: ContentSnapshot) {
  return topicOptions(snap).map((topic) => ({
    topic: topic.title,
    chapters: snap.chapters
      .filter((c) => c.topic_id === topic.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((c) => ({ id: c.id, title: c.title })),
  }));
}

export function findOr404<T extends { id: string }>(rows: T[], id: string): T {
  const row = rows.find((r) => r.id === id);
  if (!row) notFound();
  return row;
}

export { positionOf };
