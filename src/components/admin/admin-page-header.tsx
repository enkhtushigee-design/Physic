import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { mnAdmin } from "@/lib/i18n/mn-admin";

export function AdminPageHeader({ title, intro, back = true, actions }: { title: string; intro?: string; back?: boolean; actions?: ReactNode }) {
  return (
    <div className="mb-8">
      {back && (
        <Link href="/admin" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">
          <ArrowLeftIcon size={16} />
          {mnAdmin.nav.content}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">{title}</h1>
          {intro && <p className="mt-2 max-w-2xl text-ink-2">{intro}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function StatusBadge({ published, noVideo }: { published: boolean; noVideo?: boolean }) {
  return (
    <>
      {!published && (
        <span className="rounded-md bg-warning-soft px-1.5 py-0.5 text-xs font-medium text-warning">{mnAdmin.dashboard.draft}</span>
      )}
      {noVideo && (
        <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-ink-3">{mnAdmin.dashboard.noVideo}</span>
      )}
    </>
  );
}
