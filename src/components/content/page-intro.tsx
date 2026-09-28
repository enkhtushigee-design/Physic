import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";

export function PageIntro({
  crumbs,
  eyebrow,
  title,
  description,
  meta,
  children,
}: {
  crumbs?: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string | null;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="relative border-b border-line">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Container size="md" className="relative py-10 sm:py-14">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && (
          <p className={`${crumbs ? "mt-8" : ""} text-sm font-semibold uppercase tracking-[0.12em] text-accent`}>{eyebrow}</p>
        )}
        <h1
          className={`${eyebrow ? "mt-3" : crumbs ? "mt-8" : ""} font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl`}
        >
          {title}
        </h1>
        {description && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">{description}</p>}
        {meta && <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-3">{meta}</div>}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </div>
  );
}
