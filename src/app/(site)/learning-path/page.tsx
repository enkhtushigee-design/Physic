import type { Metadata } from "next";
import Link from "next/link";
import { LessonRow } from "@/components/content/lesson-row";
import { PageIntro } from "@/components/content/page-intro";
import { NextUpCard } from "@/components/progress/next-up-card";
import { ProgressMeter } from "@/components/progress/progress-meter";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { lessonIdsOf } from "@/lib/content/build-catalog";
import { getCatalog, getPathLessons } from "@/lib/content/catalog";
import { mn } from "@/lib/i18n/mn";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: mn.path.title,
  description: mn.path.intro,
  alternates: { canonical: "/learning-path" },
};

export default async function LearningPathPage() {
  const [{ topics }, path] = await Promise.all([getCatalog(), getPathLessons()]);
  const withLessons = topics.filter((t) => t.lessonCount > 0);

  return (
    <>
      <PageIntro
        crumbs={[{ label: mn.nav.home, href: "/" }, { label: mn.path.title }]}
        title={mn.path.title}
        description={mn.path.intro}
      />
      <Container size="md" className="mt-10">
        {withLessons.length === 0 ? (
          <EmptyState title={mn.path.empty} />
        ) : (
          <>
            <NextUpCard path={path} />
            <div className="mt-12 space-y-14">
              {withLessons.map((topic) => (
                <section key={topic.id} aria-labelledby={`topic-${topic.id}`}>
                  <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="font-display text-sm font-semibold tabular-nums text-ink-3">
                        {String(topic.number).padStart(2, "0")}
                      </p>
                      <h2 id={`topic-${topic.id}`} className="font-display text-3xl font-semibold tracking-tight text-ink">
                        <Link href={topic.href} className="hover:text-accent">
                          {topic.title}
                        </Link>
                      </h2>
                    </div>
                    <div className="sm:w-56">
                      <ProgressMeter lessonIds={lessonIdsOf(topic)} size="sm" showLabel={false} />
                    </div>
                  </div>
                  <ol className="mt-6 space-y-8 border-l-2 border-line pl-6 sm:pl-8">
                    {topic.chapters
                      .filter((c) => c.lessons.length > 0)
                      .map((chapter) => (
                        <li key={chapter.id} className="relative">
                          <span
                            aria-hidden="true"
                            className="absolute -left-[2.05rem] top-1 flex size-4 items-center justify-center rounded-full border-2 border-accent bg-bg sm:-left-[2.55rem]"
                          />
                          <h3 className="font-display text-xl font-semibold text-ink">
                            <Link href={chapter.href} className="hover:text-accent">
                              {chapter.number}. {chapter.title}
                            </Link>
                          </h3>
                          <ol className="-mx-4 mt-3 space-y-0.5">
                            {chapter.lessons.map((lesson) => (
                              <LessonRow key={lesson.id} lesson={lesson} compact />
                            ))}
                          </ol>
                        </li>
                      ))}
                  </ol>
                </section>
              ))}
            </div>
          </>
        )}
      </Container>
    </>
  );
}
