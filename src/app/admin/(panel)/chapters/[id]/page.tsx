import type { Metadata } from "next";
import { EditorLayout } from "@/components/admin/editor-layout";
import { ChapterForm } from "@/components/admin/entity-forms";
import { findOr404, positionOf, requireSnapshot, topicOptions } from "@/lib/admin/editor-data";
import { mnAdmin } from "@/lib/i18n/mn-admin";

export const metadata: Metadata = { title: mnAdmin.pages.editChapter };

export default async function EditChapterPage({ params }: PageProps<"/admin/chapters/[id]">) {
  const { id } = await params;
  const snap = await requireSnapshot();
  const chapter = findOr404(snap.chapters, id);
  const siblings = snap.chapters.filter((c) => c.topic_id === chapter.topic_id);
  return (
    <EditorLayout title={mnAdmin.pages.editChapter} deletable={{ table: "chapters", id }}>
      <ChapterForm
        chapter={chapter}
        topics={topicOptions(snap)}
        position={positionOf(siblings, id)}
        maxPosition={siblings.length}
      />
    </EditorLayout>
  );
}
