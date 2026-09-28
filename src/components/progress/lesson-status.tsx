"use client";

import { CheckCircleIcon, CircleIcon } from "@/components/ui/icons";
import { mn } from "@/lib/i18n/mn";
import { useProgress } from "@/lib/progress/use-progress";

/** Хичээлийн дугаар эсвэл дууссан тэмдэг. Дэлгэц уншигчид төлөвийг текстээр хэлнэ. */
export function LessonStatus({ lessonId, number }: { lessonId: string; number?: number }) {
  const done = lessonId in useProgress().completed;
  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center">
      {done ? (
        <CheckCircleIcon size={28} className="text-success" />
      ) : number !== undefined ? (
        <span className="flex size-7 items-center justify-center rounded-full border border-line-strong bg-surface text-xs font-semibold tabular-nums text-ink-2">
          {number}
        </span>
      ) : (
        <CircleIcon size={24} className="text-line-strong" />
      )}
      <span className="sr-only">{done ? mn.progress.completed : mn.progress.notStarted}</span>
    </span>
  );
}

export function ChapterDone({ lessonIds, children }: { lessonIds: string[]; children: React.ReactNode }) {
  const { completed } = useProgress();
  if (lessonIds.length === 0 || !lessonIds.every((id) => id in completed)) return null;
  return <>{children}</>;
}
