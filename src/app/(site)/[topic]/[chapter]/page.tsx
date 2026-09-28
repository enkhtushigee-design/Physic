import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonRow } from "@/components/content/lesson-row";
import { PageIntro } from "@/components/content/page-intro";
import { ChapterDone } from "@/components/progress/lesson-status";
import { ProgressMeter } from "@/components/progress/progress-meter";
import { ResumeLink } from "@/components/progress/resume-link";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircleIcon, ClockIcon } from "@/components/ui/icons";
import { findChapter } from "@/lib/content/catalog";
import { mn } from "@/lib/i18n/mn";

export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ chapter: string }[]> {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/[topic]/[chapter]">): Promise<Metadata> {
  const { topic: topicSlug, chapter: chapterSlug } = await params;
  const found = await findChapter(topicSlug, chapterSlug);
  if (!found) return {};
  const { topic, chapter } = found;
  const title = `${chapter.title} — ${topic.title}`;
  const description = chapter.description ?? `${topic.title} сэдвийн “${chapter.title}” бүлгийн видео хичээлүүд.`;
  return {
    title,
    description,
    alternates: { canonical: chapter.href },
    openGraph: { title, description, url: chapter.href },
  };
}

export default async function ChapterPage({ params }: PageProps<"/[topic]/[chapter]">) {
  const { topic: topicSlug, chapter: chapterSlug } = await params;
  const found = await findChapter(topicSlug, chapterSlug);
  if (!found) notFound();
  const { topic, chapter } = found;
  const lessonIds = chapter.lessons.map((l) => l.id);

  return (
    <>
      <PageIntro
        crumbs={[
          { label: mn.nav.topics, href: "/physics" },
          { label: topic.title, href: topic.href },
          { label: chapter.title },
        ]}
        eyebrow={`${topic.title} · ${String(chapter.number).padStart(2, "0")}`}
        title={chapter.title}
        description={chapter.description}
        meta={
          <>
            <span>{mn.counts.lessons(chapter.lessons.length)}</span>
            {chapter.totalDurationSeconds > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <ClockIcon size={15} />
                  <span className="sr-only">{mn.chapter.totalDuration}: </span>
                  {mn.duration.format(chapter.totalDurationSeconds)}
                </span>
              </>
            )}
          </>
        }
      >
        {lessonIds.length > 0 && (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="flex-1">
              <ProgressMeter lessonIds={lessonIds} label={mn.chapter.progressLabel} />
            </div>
            <ResumeLink
              lessons={chapter.lessons}
              startLabel={mn.chapter.start}
              continueLabel={mn.chapter.continue}
              fallbackHref={chapter.href}
              size="md"
            />
          </div>
        )}
      </PageIntro>

      <Container size="md" className="mt-10">
        <ChapterDone lessonIds={lessonIds}>
          <p className="mb-6 flex items-center gap-3 rounded-xl border border-success/25 bg-success-soft px-4 py-3 font-medium text-success">
            <CheckCircleIcon size={24} />
            {mn.chapter.allDone}
          </p>
        </ChapterDone>

        <div className="mb-5 flex flex-col gap-1">
          <h2 className="font-display text-2xl font-semibold text-ink">{mn.chapter.lessonsHeading}</h2>
          {chapter.lessons.length > 1 && <p className="text-sm text-ink-3">{mn.chapter.orderHint}</p>}
        </div>
        {chapter.lessons.length > 0 ? (
          <ol className="-mx-4 space-y-1">
            {chapter.lessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} />
            ))}
          </ol>
        ) : (
          <EmptyState title={mn.chapter.empty} />
        )}
      </Container>
    </>
  );
}
