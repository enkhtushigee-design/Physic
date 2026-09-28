"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/button";
import { firstIncomplete } from "@/lib/progress/store";
import { useProgress } from "@/lib/progress/use-progress";

/**
 * "Эхлүүлэх" товч. Хэрэглэгч аль хэдийн эхэлсэн бол дараагийн дуусаагүй
 * хичээл рүү "Үргэлжлүүлэх" болж хувирна.
 */
export function ResumeLink({
  lessons,
  startLabel,
  continueLabel,
  fallbackHref,
  size = "lg",
  variant = "primary",
}: {
  lessons: { id: string; href: string }[];
  startLabel: string;
  continueLabel: string;
  fallbackHref: string;
  size?: "md" | "lg";
  variant?: "primary" | "secondary";
}) {
  const state = useProgress();
  const started = lessons.some((l) => l.id in state.completed);
  const target = firstIncomplete(state, lessons) ?? lessons[0];
  return (
    <Link href={target?.href ?? fallbackHref} className={buttonClass({ size, variant })}>
      {started ? continueLabel : startLabel}
      <ArrowRightIcon size={18} />
    </Link>
  );
}
