import type { ReactNode } from "react";
import { BookIcon } from "./icons";

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-surface-2 text-ink-3">
        <BookIcon />
      </div>
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      {children && <div className="mx-auto mt-2 max-w-md text-ink-2">{children}</div>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
