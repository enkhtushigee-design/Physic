"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import { mn } from "@/lib/i18n/mn";
import { summarize } from "@/lib/progress/store";
import { useProgress } from "@/lib/progress/use-progress";

export function ProgressMeter({
  lessonIds,
  label = mn.progress.label,
  size = "md",
  showLabel = true,
}: {
  lessonIds: string[];
  label?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const { done, total, percent } = summarize(useProgress(), lessonIds);
  if (total === 0) return null;
  return (
    <div className="w-full">
      <div className={`mb-2 flex items-baseline justify-between gap-3 text-ink-3 ${size === "sm" ? "text-xs" : "text-sm"}`}>
        <span>
          {showLabel && <span className="font-medium text-ink-2">{label} · </span>}
          {mn.progress.completedCount(done, total)}
        </span>
        <span className={`tabular-nums font-medium ${percent === 100 ? "text-success" : "text-ink-2"}`}>
          {mn.progress.percent(percent)}
        </span>
      </div>
      <ProgressBar value={percent} label={label} size={size} />
    </div>
  );
}
