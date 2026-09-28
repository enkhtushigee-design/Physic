"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { mn } from "@/lib/i18n/mn";
import type { PathLesson } from "@/lib/content/types";
import { firstIncomplete, summarize } from "@/lib/progress/store";
import { useProgress } from "@/lib/progress/use-progress";

/**
 * Суралцах замын дагуух дараагийн хичээлийг санал болгоно.
 * onlyWhenStarted=true үед хэрэглэгч эхлээгүй бол юу ч харуулахгүй (нүүр хуудсанд).
 */
export function NextUpCard({
  path,
  heading = mn.path.nextUp,
  onlyWhenStarted = false,
}: {
  path: PathLesson[];
  heading?: string;
  onlyWhenStarted?: boolean;
}) {
  const state = useProgress();
  const ids = path.map((p) => p.id);
  const { done, total, percent } = summarize(state, ids);
  if (total === 0 || (onlyWhenStarted && done === 0)) return null;
  const next = firstIncomplete(state, path);

  return (
    <section
      aria-label={heading}
      className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      {next ? (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{heading}</p>
            <p className="mt-2 truncate font-display text-xl font-semibold text-ink">{next.title}</p>
            <p className="mt-1 truncate text-sm text-ink-3">
              {next.topicTitle} · {next.chapterTitle}
            </p>
          </div>
          <Link
            href={next.href}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 font-medium text-accent-ink transition-colors hover:bg-accent-strong"
          >
            {mn.home.continueNext}
            <ArrowRightIcon size={18} />
          </Link>
        </div>
      ) : (
        <p className="flex items-center gap-3 font-medium text-success">
          <CheckCircleIcon size={26} />
          {mn.path.allDone}
        </p>
      )}
      <div className="mt-5 border-t border-line pt-4">
        <div className="mb-2 flex justify-between text-sm text-ink-3">
          <span>{mn.progress.completedCount(done, total)}</span>
          <span className="tabular-nums font-medium text-ink-2">{mn.progress.percent(percent)}</span>
        </div>
        <ProgressBar value={percent} label={mn.progress.label} size="sm" />
      </div>
    </section>
  );
}
