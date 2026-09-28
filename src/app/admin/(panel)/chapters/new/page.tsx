import type { Metadata } from "next";
import Link from "next/link";
import { EditorLayout } from "@/components/admin/editor-layout";
import { ChapterForm } from "@/components/admin/entity-forms";
import { buttonClass } from "@/components/ui/button";
import { requireSnapshot, topicOptions } from "@/lib/admin/editor-data";
import { mnAdmin } from "@/lib/i18n/mn-admin";

export const metadata: Metadata = { title: mnAdmin.pages.newChapter };

export default async function NewChapterPage({ searchParams }: PageProps<"/admin/chapters/new">) {
  const requested = (await searchParams).topic;
  const snap = await requireSnapshot();
  const topics = topicOptions(snap);
  const topicId = topics.find((t) => t.id === requested)?.id ?? topics[0]?.id;

  return (
    <EditorLayout title={mnAdmin.pages.newChapter}>
      {topics.length === 0 ? (
        <div className="space-y-4">
          <p className="text-ink-2">{mnAdmin.dashboard.empty}</p>
          <Link href="/admin/topics/new" className={buttonClass()}>
            {mnAdmin.dashboard.addTopic}
          </Link>
        </div>
      ) : (
        <ChapterForm
          topics={topics}
          defaultTopicId={topicId}
          maxPosition={snap.chapters.filter((c) => c.topic_id === topicId).length + 1}
        />
      )}
    </EditorLayout>
  );
}
