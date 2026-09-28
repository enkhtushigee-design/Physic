"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { ArrowRightIcon, CheckCircleIcon, CheckIcon } from "@/components/ui/icons";
import { mn } from "@/lib/i18n/mn";
import { progressStore, useHydrated, useProgress } from "@/lib/progress/use-progress";

type Feedback = { tone: "success" | "neutral" | "error"; text: string } | null;

export function CompletionPanel({
  lessonId,
  next,
}: {
  lessonId: string;
  next?: { title: string; href: string };
}) {
  const hydrated = useHydrated();
  const completedAt = useProgress().completed[lessonId];
  const [feedback, setFeedback] = useState<Feedback>(null);

  const toggle = (value: boolean) => {
    const saved = progressStore.setCompleted(lessonId, value);
    if (!saved) setFeedback({ tone: "error", text: mn.progress.storageUnavailable });
    else setFeedback(value ? { tone: "success", text: mn.progress.markedSuccess } : { tone: "neutral", text: mn.progress.undone });
  };

  return (
    <section
      aria-labelledby="completion-heading"
      className={`rounded-2xl border p-5 transition-colors sm:p-6 ${
        completedAt ? "border-success/30 bg-success-soft/60" : "border-line bg-surface"
      }`}
    >
      <h2 id="completion-heading" className="sr-only">
        {mn.progress.label}
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {completedAt ? (
          <>
            <p className="flex items-center gap-3 font-medium text-success">
              <CheckCircleIcon size={28} />
              {mn.progress.completedState}
            </p>
            <div className="flex flex-wrap gap-2">
              {next && (
                <Link href={next.href} className={buttonClass({ variant: "primary" })}>
                  {mn.progress.goNext}
                  <ArrowRightIcon size={18} />
                </Link>
              )}
              <button type="button" onClick={() => toggle(false)} className={buttonClass({ variant: "ghost" })}>
                {mn.progress.undo}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-ink-3">{mn.progress.storageNote}</p>
            <button
              type="button"
              onClick={() => toggle(true)}
              disabled={!hydrated}
              className={buttonClass({ variant: "primary", size: "lg", className: "w-full sm:w-auto" })}
            >
              <CheckIcon size={18} />
              {mn.progress.markComplete}
            </button>
          </>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`text-sm empty:hidden ${feedback ? "mt-4" : ""} ${
          feedback?.tone === "success" ? "text-success" : feedback?.tone === "error" ? "text-danger" : "text-ink-3"
        }`}
      >
        {feedback?.text}
      </p>
    </section>
  );
}
