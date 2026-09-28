import type { Metadata } from "next";
import { EditorLayout } from "@/components/admin/editor-layout";
import { LessonForm } from "@/components/admin/entity-forms";
import { chapterGroups, findOr404, positionOf, requireSnapshot } from "@/lib/admin/editor-data";
import { mnAdmin } from "@/lib/i18n/mn-admin";

export const metadata: Metadata = { title: mnAdmin.pages.editLesson };

export default async function EditLessonPage({ params }: PageProps<"/admin/lessons/[id]">) {
  const { id } = await params;
  const snap = await requireSnapshot();
  const lesson = findOr404(snap.lessons, id);
  const siblings = snap.lessons.filter((l) => l.chapter_id === lesson.chapter_id);
  return (
    <EditorLayout title={mnAdmin.pages.editLesson} deletable={{ table: "lessons", id }}>
      <LessonForm
        lesson={lesson}
        chapterGroups={chapterGroups(snap).filter((g) => g.chapters.length > 0)}
        position={positionOf(siblings, id)}
        maxPosition={siblings.length}
      />
    </EditorLayout>
  );
}
