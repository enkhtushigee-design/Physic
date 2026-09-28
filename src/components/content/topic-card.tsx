import Link from "next/link";
import { ProgressMeter } from "@/components/progress/progress-meter";
import { ArrowRightIcon } from "@/components/ui/icons";
import { lessonIdsOf } from "@/lib/content/build-catalog";
import type { Topic } from "@/lib/content/types";
import { mn } from "@/lib/i18n/mn";

export function TopicCard({ topic }: { topic: Topic }) {
  const lessonIds = lessonIdsOf(topic);
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-sm font-semibold tabular-nums text-ink-3">
          {String(topic.number).padStart(2, "0")}
        </span>
        <ArrowRightIcon
          size={18}
          className="text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
        />
      </div>
      <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
        <Link href={topic.href} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          {topic.title}
        </Link>
      </h3>
      {topic.description && <p className="mt-2 line-clamp-3 text-[0.95rem] text-ink-2">{topic.description}</p>}
      <p className="mt-4 text-sm text-ink-3">
        {mn.counts.chapters(topic.chapters.length)} · {mn.counts.lessons(topic.lessonCount)}
      </p>
      {lessonIds.length > 0 && (
        <div className="mt-auto pt-6">
          <ProgressMeter lessonIds={lessonIds} size="sm" showLabel={false} />
        </div>
      )}
    </article>
  );
}
