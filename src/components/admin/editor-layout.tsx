import type { ReactNode } from "react";
import type { ContentTable } from "@/lib/content/types";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { AdminPageHeader } from "./admin-page-header";
import { DeleteForm } from "./delete-form";

export function EditorLayout({
  title,
  children,
  deletable,
}: {
  title: string;
  children: ReactNode;
  deletable?: { table: ContentTable; id: string };
}) {
  return (
    <div className="max-w-2xl">
      <AdminPageHeader title={title} />
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">{children}</div>
      {deletable && (
        <section aria-labelledby="danger-heading" className="mt-8 rounded-2xl border border-danger/25 p-6 sm:p-8">
          <h2 id="danger-heading" className="mb-3 font-display text-lg font-semibold text-danger">
            {mnAdmin.pages.dangerZone}
          </h2>
          <DeleteForm table={deletable.table} id={deletable.id} />
        </section>
      )}
    </div>
  );
}
