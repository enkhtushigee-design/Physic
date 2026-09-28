import Link from "next/link";
import { mn } from "@/lib/i18n/mn";
import { ChevronRightIcon } from "./icons";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label={mn.nav.breadcrumb} className="text-sm text-ink-3">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="truncate rounded hover:text-ink hover:underline underline-offset-4">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="truncate text-ink-2">
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRightIcon size={14} className="shrink-0 text-line-strong" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
