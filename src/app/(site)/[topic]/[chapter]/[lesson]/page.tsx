import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonRow } from "@/components/content/lesson-row";
import { VideoPlayer } from "@/components/content/video-player";
import { CompletionPanel } from "@/components/progress/completion-panel";
import { ProgressMeter } from "@/components/progress/progress-meter";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, ExternalIcon } from "@/components/ui/icons";
import { findLesson } from "@/lib/content/catalog";
import { toIsoDuration } from "@/lib/duration";
import { mn } from "@/lib/i18n/mn";
import { siteUrl } from "@/lib/site";
import { youtubeThumbnailUrl, youtubeWatchUrl } from "@/lib/youtube";

export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ lesson: string }[]> {
  return [];
}

type Props = PageProps<"/[topic]/[chapter]/[lesson]">;

async function load(params: Props["params"]) {
  const { topic, chapter, lesson } = await params;
  return findLesson(topic, chapter, lesson);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load(params);
  if (!found) return {};
  const { topic, chapter, lesson } = found;
  const title = `${lesson.title} — ${chapter.title}`;
  const description = lesson.description ?? `${topic.title} · ${chapter.title}. ${mn.lesson.label(lesson.number)}.`;
  return {
    title,
    description,
    alternates: { canonical: lesson.href },
    openGraph: {
      type: "article",
      title,
      description,
      url: lesson.href,
      images: lesson.youtube_video_id ? [{ url: youtubeThumbnailUrl(lesson.youtube_video_id), width: 480, height: 360 }] : undefined,
    },
  };
}

export default async function LessonPage({ params }: Props) {
  const found = await load(params);
  if (!found) notFound();
  const { topic, chapter, lesson, prev, next } = found;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.description ?? undefined,
    inLanguage: "mn",
    learningResourceType: "Видео хичээл",
    educationalLevel: topic.title,
    url: `${siteUrl()}${lesson.href}`,
    timeRequired: lesson.duration_seconds ? toIsoDuration(lesson.duration_seconds) : undefined,
    teaches: lesson.learning_objectives.length ? lesson.learning_objectives : undefined,
    isPartOf: { "@type": "Course", name: `${topic.title}: ${chapter.title}`, url: `${siteUrl()}${chapter.href}` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify нь "<" тэмдгийг escape хийдэггүй тул гараар хамгаална.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Container className="pt-8 sm:pt-10">
        <Breadcrumbs
          items={[
            { label: topic.title, href: topic.href },
            { label: chapter.title, href: chapter.href },
            { label: lesson.title },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <article className="min-w-0" aria-labelledby="lesson-title">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-accent">
                {chapter.title} · {mn.lesson.label(lesson.number)}
              </p>
              <h1 id="lesson-title" className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {lesson.title}
              </h1>
              {lesson.duration_seconds ? (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-3">
                  <ClockIcon size={15} />
                  {mn.duration.format(lesson.duration_seconds)}
                </p>
              ) : null}
            </header>

            <section aria-label={mn.lesson.videoRegion} className="mt-7">
              {lesson.youtube_video_id ? (
                <>
                  <VideoPlayer videoId={lesson.youtube_video_id} title={lesson.title} />
                  <a
                    href={youtubeWatchUrl(lesson.youtube_video_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink"
                  >
                    {mn.lesson.watchOnYoutube}
                    <ExternalIcon size={14} />
                  </a>
                </>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface-2 p-6 text-center text-ink-3">
                  {mn.lesson.noVideo}
                </div>
              )}
            </section>

            <div className="mt-8">
              <CompletionPanel lessonId={lesson.id} next={next} />
            </div>

            {lesson.description && (
              <section aria-labelledby="about-heading" className="mt-10">
                <h2 id="about-heading" className="font-display text-2xl font-semibold text-ink">
                  {mn.lesson.aboutHeading}
                </h2>
                <div className="prose-mn mt-3 whitespace-pre-line">{lesson.description}</div>
              </section>
            )}

            {lesson.learning_objectives.length > 0 && (
              <section aria-labelledby="objectives-heading" className="mt-10 rounded-2xl border border-line bg-surface p-6">
                <h2 id="objectives-heading" className="font-display text-xl font-semibold text-ink">
                  {mn.lesson.objectivesHeading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {lesson.learning_objectives.map((objective) => (
                    <li key={objective} className="flex gap-3 text-ink-2">
                      <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <nav aria-label={mn.lesson.lessonNav} className="mt-12 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={prev.href}
                  className="group rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
                >
                  <span className="flex items-center gap-1.5 text-sm text-ink-3">
                    <ArrowLeftIcon size={16} className="transition-transform group-hover:-translate-x-0.5" />
                    {mn.lesson.prev}
                  </span>
                  <span className="mt-1 block font-medium text-ink group-hover:text-accent">{prev.title}</span>
                  {prev.chapterTitle !== chapter.title && (
                    <span className="mt-0.5 block text-xs text-ink-3">{prev.chapterTitle}</span>
                  )}
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {next ? (
                <Link
                  href={next.href}
                  className="group rounded-xl border border-line bg-surface p-4 text-right transition-colors hover:border-line-strong"
                >
                  <span className="flex items-center justify-end gap-1.5 text-sm text-ink-3">
                    {mn.lesson.next}
                    <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1 block font-medium text-ink group-hover:text-accent">{next.title}</span>
                  {next.chapterTitle !== chapter.title && (
                    <span className="mt-0.5 block text-xs text-ink-3">{next.chapterTitle}</span>
                  )}
                </Link>
              ) : (
                <p className="rounded-xl border border-dashed border-line p-4 text-sm text-ink-3 sm:text-right">
                  {mn.lesson.pathFinished}
                </p>
              )}
            </nav>
          </article>

          <aside aria-labelledby="other-lessons-heading" className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-surface p-4">
              <div className="px-2 pb-3 pt-1">
                <h2 id="other-lessons-heading" className="font-display text-lg font-semibold text-ink">
                  {mn.lesson.otherLessons}
                </h2>
                <Link href={chapter.href} className="text-sm text-ink-3 hover:text-accent">
                  {chapter.title}
                </Link>
                <div className="mt-3">
                  <ProgressMeter lessonIds={chapter.lessons.map((l) => l.id)} size="sm" showLabel={false} />
                </div>
              </div>
              <ol className="max-h-[60vh] space-y-0.5 overflow-y-auto">
                {chapter.lessons.map((item) => (
                  <LessonRow key={item.id} lesson={item} current={item.id === lesson.id} compact />
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
