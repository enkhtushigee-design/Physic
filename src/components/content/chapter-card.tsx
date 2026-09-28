import Link from "next/link";
import { ProgressMeter } from "@/components/progress/progress-meter";
import { ChevronRightIcon, ClockIcon } from "@/components/ui/icons";
import type { Chapter } from "@/lib/content/types";
import { mn } from "@/lib/i18n/mn";

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  const lessonIds = chapter.lessons.map((l) => l.id);
  return (
    <article className="group relative grid grid-cols-[auto_1fr] gap-x-5 gap-y-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong sm:grid-cols-[auto_1fr_auto] sm:p-6">
      <span
        aria-hidden="true"
        className="font-display text-3xl font-semibold leading-none tabular-nums text-line-strong transition-colors group-hover:text-accent sm:text-4xl"
      >
        {String(chapter.number).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
          <Link href={chapter.href} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
            <span className="sr-only">{chapter.number}. </span>
            {chapter.title}
          </Link>
        </h3>
        {chapter.description && <p className="mt-1.5 line-clamp-2 text-[0.95rem] text-ink-2">{chapter.description}</p>}
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
          <span>{mn.counts.lessons(chapter.lessons.length)}</span>
          {chapter.totalDurationSeconds > 0 && (
            <span className="inline-flex items-center gap-1">
              <ClockIcon size={15} />
              {mn.duration.format(chapter.totalDurationSeconds)}
            </span>
          )}
        </p>
      </div>
      <ChevronRightIcon
        size={20}
        className="hidden self-center text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-accent sm:block"
      />
      {lessonIds.length > 0 && (
        <div className="col-span-2 sm:col-span-3">
          <ProgressMeter lessonIds={lessonIds} size="sm" showLabel={false} />
        </div>
      )}
    </article>
  );
}
