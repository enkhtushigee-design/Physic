import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { toCsv } from "@/lib/admin/csv";
import { TEMPLATE_HEADER } from "@/lib/admin/import-plan";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { ImportForm } from "./import-form";

export const metadata: Metadata = { title: mnAdmin.import.heading };

const T = mnAdmin.import;

export default function ImportPage() {
  // Excel монгол үсгийг зөв таних тул UTF-8 BOM-той татна.
  const template = `data:text/csv;charset=utf-8,${encodeURIComponent(`﻿${toCsv([TEMPLATE_HEADER])}\r\n`)}`;

  return (
    <div className="max-w-4xl">
      <AdminPageHeader title={T.heading} intro={T.intro} />
      <section className="mb-8 rounded-2xl border border-line bg-surface-2/60 p-6">
        <h2 className="font-display text-lg font-semibold text-ink">{T.formatHeading}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">{T.formatText}</p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface p-3 font-mono text-xs text-ink-2">
          {TEMPLATE_HEADER.join(",")}
        </pre>
        <a href={template} download="magsar-physics-lessons.csv" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-strong">
          {T.downloadTemplate}
        </a>
      </section>
      <ImportForm />
    </div>
  );
}
