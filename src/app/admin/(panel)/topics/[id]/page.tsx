import type { Metadata } from "next";
import { EditorLayout } from "@/components/admin/editor-layout";
import { TopicForm } from "@/components/admin/entity-forms";
import { findOr404, positionOf, requireSnapshot } from "@/lib/admin/editor-data";
import { mnAdmin } from "@/lib/i18n/mn-admin";

export const metadata: Metadata = { title: mnAdmin.pages.editTopic };

export default async function EditTopicPage({ params }: PageProps<"/admin/topics/[id]">) {
  const { id } = await params;
  const snap = await requireSnapshot();
  const topic = findOr404(snap.topics, id);
  return (
    <EditorLayout title={mnAdmin.pages.editTopic} deletable={{ table: "topics", id }}>
      <TopicForm topic={topic} position={positionOf(snap.topics, id)} maxPosition={snap.topics.length} />
    </EditorLayout>
  );
}
