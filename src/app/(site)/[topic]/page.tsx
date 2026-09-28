import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterCard } from "@/components/content/chapter-card";
import { PageIntro } from "@/components/content/page-intro";
import { ProgressMeter } from "@/components/progress/progress-meter";
import { ResumeLink } from "@/components/progress/resume-link";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { lessonIdsOf } from "@/lib/content/build-catalog";
import { findTopic } from "@/lib/content/catalog";
import { mn } from "@/lib/i18n/mn";

export const revalidate = 3600;

// Бүх замыг анх зочлох үед нь үүсгээд кэшлэнэ (ISR).
export async function generateStaticParams(): Promise<{ topic: string }[]> {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/[topic]">): Promise<Metadata> {
  const topic = await findTopic((await params).topic);
  if (!topic) return {};
  const description = topic.description ?? `${topic.title} сэдвийн физикийн видео хичээлүүд.`;
  return {
    title: topic.title,
    description,
    alternates: { canonical: topic.href },
    openGraph: { title: topic.title, description, url: topic.href },
  };
}

export default async function TopicPage({ params }: PageProps<"/[topic]">) {
  const topic = await findTopic((await params).topic);
  if (!topic) notFound();

  const lessonIds = lessonIdsOf(topic);
  const orderedLessons = topic.chapters.flatMap((c) => c.lessons.map((l) => ({ id: l.id, href: l.href })));

  return (
    <>
      <PageIntro
        crumbs={[
          { label: mn.nav.topics, href: "/physics" },
          { label: topic.title },
        ]}
        title={topic.title}
        description={topic.description}
        meta={
          <>
            <span>{mn.counts.chapters(topic.chapters.length)}</span>
            <span aria-hidden="true">·</span>
            <span>{mn.counts.lessons(topic.lessonCount)}</span>
          </>
        }
      >
        {lessonIds.length > 0 && (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="flex-1">
              <ProgressMeter lessonIds={lessonIds} label={mn.topic.progressLabel} />
            </div>
            <ResumeLink
              lessons={orderedLessons}
              startLabel={mn.chapter.start}
              continueLabel={mn.chapter.continue}
              fallbackHref={topic.href}
              size="md"
            />
          </div>
        )}
      </PageIntro>

      <Container size="md" className="mt-10">
        <h2 className="mb-5 font-display text-2xl font-semibold text-ink">{mn.topic.chaptersHeading}</h2>
        {topic.chapters.length > 0 ? (
          <div className="space-y-4">
            {topic.chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        ) : (
          <EmptyState title={mn.topic.empty} />
        )}
      </Container>
    </>
  );
}
