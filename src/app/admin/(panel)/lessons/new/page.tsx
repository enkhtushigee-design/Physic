import type { Metadata } from "next";
import Link from "next/link";
import { EditorLayout } from "@/components/admin/editor-layout";
import { LessonForm } from "@/components/admin/entity-forms";
import { buttonClass } from "@/components/ui/button";
import { chapterGroups, requireSnapshot } from "@/lib/admin/editor-data";
import { mnAdmin } from "@/lib/i18n/mn-admin";

export const metadata: Metadata = { title: mnAdmin.pages.newLesson };

export default async function NewLessonPage({ searchParams }: PageProps<"/admin/lessons/new">) {
  const requested = (await searchParams).chapter;
  const snap = await requireSnapshot();
  const groups = chapterGroups(snap).filter((g) => g.chapters.length > 0);
  const allChapters = groups.flatMap((g) => g.chapters);
  const chapterId = allChapters.find((c) => c.id === requested)?.id ?? allChapters[0]?.id;

  return (
    <EditorLayout title={mnAdmin.pages.newLesson}>
      {allChapters.length === 0 ? (
        <div className="space-y-4">
          <p className="text-ink-2">{mnAdmin.dashboard.noChapters}</p>
          <Link href="/admin/chapters/new" className={buttonClass()}>
            {mnAdmin.dashboard.addChapter}
          </Link>
        </div>
      ) : (
        <LessonForm
          chapterGroups={groups}
          defaultChapterId={chapterId}
          maxPosition={snap.lessons.filter((l) => l.chapter_id === chapterId).length + 1}
        />
      )}
    </EditorLayout>
  );
}
