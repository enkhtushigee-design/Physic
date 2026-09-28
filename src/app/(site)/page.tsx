import Link from "next/link";
import { TopicCard } from "@/components/content/topic-card";
import { TrajectoryArt } from "@/components/content/trajectory-art";
import { NextUpCard } from "@/components/progress/next-up-card";
import { ResumeLink } from "@/components/progress/resume-link";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getCatalog, getPathLessons } from "@/lib/content/catalog";
import { mn } from "@/lib/i18n/mn";

export const revalidate = 3600;

export default async function HomePage() {
  const [{ topics }, path] = await Promise.all([getCatalog(), getPathLessons()]);
  const chapterCount = topics.reduce((sum, t) => sum + t.chapters.length, 0);
  const hasContent = topics.length > 0;
  const exampleTopic = topics.find((t) => t.chapters.some((c) => c.lessons.length > 0));

  return (
    <>
      {/* Нүүр хэсэг */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_95%)]" />
        <Container className="relative grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{mn.home.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              {mn.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{mn.home.heroText}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ResumeLink
                lessons={path}
                startLabel={mn.home.primaryCta}
                continueLabel={mn.home.continueCta}
                fallbackHref="/physics"
              />
              <Link href="/physics" className={buttonClass({ variant: "secondary", size: "lg" })}>
                {mn.home.secondaryCta}
              </Link>
            </div>
            {hasContent && (
              <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-3">
                {(
                  [
                    [topics.length, mn.counts.units.topics],
                    [chapterCount, mn.counts.units.chapters],
                    [path.length, mn.counts.units.lessons],
                  ] as const
                ).map(([value, unit]) => (
                  <li key={unit} className="flex items-baseline gap-1.5">
                    <span className="font-display text-2xl font-semibold tabular-nums text-ink">{value}</span>
                    {unit}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-3xl border border-line bg-surface/80 p-6 shadow-[var(--shadow-lift)] backdrop-blur">
              <TrajectoryArt className="h-auto w-full" />
            </div>
          </div>
        </Container>
      </section>

      <Container className="mt-10">
        <NextUpCard path={path} heading={mn.home.continueHeading} onlyWhenStarted />
      </Container>

      {/* Сэдвүүд */}
      <section aria-labelledby="topics-heading" className="mt-16 sm:mt-20">
        <Container>
          <div className="mb-8 max-w-2xl">
            <h2 id="topics-heading" className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {mn.home.topicsHeading}
            </h2>
            <p className="mt-3 text-ink-2">{mn.home.topicsIntro}</p>
          </div>
          {hasContent ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={mn.home.emptyTitle}
              action={
                <Link href="/admin" className={buttonClass({ variant: "secondary", size: "sm" })}>
                  {mn.home.emptyAdminLink}
                </Link>
              }
            >
              {mn.home.emptyText}
            </EmptyState>
          )}
        </Container>
      </section>

      {/* Суралцах зам */}
      <section aria-labelledby="path-heading" className="mt-20 sm:mt-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 id="path-heading" className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {mn.home.pathHeading}
              </h2>
              <p className="mt-3 max-w-md text-ink-2">{mn.home.pathIntro}</p>
              <ol className="mt-8 space-y-5">
                {mn.home.pathSteps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-semibold text-accent">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{step.title}</p>
                      <p className="text-sm text-ink-3">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {exampleTopic && (
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">{mn.home.examplePathLabel}</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">{exampleTopic.title}</p>
                <ol className="mt-6 space-y-6 border-l border-line pl-6">
                  {exampleTopic.chapters
                    .filter((c) => c.lessons.length > 0)
                    .slice(0, 3)
                    .map((chapter) => (
                      <li key={chapter.id} className="relative">
                        <span className="absolute -left-[1.93rem] top-1.5 size-3 rounded-full border-2 border-accent bg-surface" />
                        <Link href={chapter.href} className="font-medium text-ink hover:text-accent">
                          {chapter.number}. {chapter.title}
                        </Link>
                        <ul className="mt-2 space-y-1 text-sm text-ink-2">
                          {chapter.lessons.slice(0, 3).map((lesson) => (
                            <li key={lesson.id} className="truncate">
                              <Link href={lesson.href} className="hover:text-ink hover:underline underline-offset-4">
                                {mn.lesson.label(lesson.number)} — {lesson.title}
                              </Link>
                            </li>
                          ))}
                          {chapter.lessons.length > 3 && <li className="text-ink-3">…</li>}
                        </ul>
                      </li>
                    ))}
                </ol>
                <Link
                  href="/learning-path"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-strong"
                >
                  {mn.home.viewFullPath}
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
