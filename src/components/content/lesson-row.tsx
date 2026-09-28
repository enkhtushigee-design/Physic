import Link from "next/link";
import { LessonStatus } from "@/components/progress/lesson-status";
import { ClockIcon, PlayIcon } from "@/components/ui/icons";
import type { Lesson } from "@/lib/content/types";
import { mn } from "@/lib/i18n/mn";

export function LessonRow({
  lesson,
  current = false,
  compact = false,
}: {
  lesson: Lesson;
  current?: boolean;
  compact?: boolean;
}) {
  return (
    <li>
      <Link
        href={lesson.href}
        aria-current={current ? "page" : undefined}
        className={`group flex items-start gap-4 rounded-xl border px-4 transition-colors ${compact ? "py-3" : "py-4"} ${
          current ? "border-accent/40 bg-accent-soft" : "border-transparent hover:border-line hover:bg-surface"
        }`}
      >
        <LessonStatus lessonId={lesson.id} number={lesson.number} />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-ink-3">
            {mn.lesson.label(lesson.number)}
            {current && <span className="ml-2 font-semibold text-accent">· {mn.lesson.current}</span>}
          </span>
          <span className={`block font-medium text-ink ${compact ? "text-[0.95rem]" : "text-base"} group-hover:text-accent`}>
            {lesson.title}
          </span>
          {!compact && lesson.description && (
            <span className="mt-1 line-clamp-2 block text-sm text-ink-2">{lesson.description}</span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1 pt-0.5 text-xs tabular-nums text-ink-3">
          {lesson.duration_seconds ? (
            <>
              <ClockIcon size={14} />
              {mn.duration.format(lesson.duration_seconds)}
            </>
          ) : (
            lesson.youtube_video_id && <PlayIcon size={14} />
          )}
        </span>
      </Link>
    </li>
  );
}
