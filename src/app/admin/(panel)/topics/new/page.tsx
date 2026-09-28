import type { Metadata } from "next";
import { EditorLayout } from "@/components/admin/editor-layout";
import { TopicForm } from "@/components/admin/entity-forms";
import { requireSnapshot } from "@/lib/admin/editor-data";
import { mnAdmin } from "@/lib/i18n/mn-admin";

export const metadata: Metadata = { title: mnAdmin.pages.newTopic };

export default async function NewTopicPage() {
  const snap = await requireSnapshot();
  return (
    <EditorLayout title={mnAdmin.pages.newTopic}>
      <TopicForm maxPosition={snap.topics.length + 1} />
    </EditorLayout>
  );
}
