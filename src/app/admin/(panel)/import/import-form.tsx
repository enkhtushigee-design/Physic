"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Field, FormAlert, TextArea } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/submit-button";
import { buttonClass } from "@/components/ui/button";
import type { PlanRow } from "@/lib/admin/import-plan";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { importAction, type ImportState } from "../../actions";

const T = mnAdmin.import;

const STATUS_STYLE: Record<PlanRow["status"], string> = {
  new: "bg-success-soft text-success",
  duplicate: "bg-surface-2 text-ink-3",
  error: "bg-danger-soft text-danger",
};

export function ImportForm() {
  // key-ийг өөрчилснөөр маягтын төлөвийг бүрэн шинэчилнэ ("дахин оруулах").
  const [round, setRound] = useState(0);
  return <ImportFlow key={round} onRestart={() => setRound((r) => r + 1)} />;
}

function ImportFlow({ onRestart }: { onRestart: () => void }) {
  const [state, action] = useActionState(importAction, { status: "idle" } as ImportState);

  if (state.status === "done" && state.result) {
    const { lessons, topics, chapters, skipped } = state.result;
    return (
      <div className="space-y-6">
        <div role="status" className="rounded-xl border border-success/30 bg-success-soft px-5 py-4 text-success">
          <p className="text-lg font-semibold">{T.success(lessons)}</p>
          <p className="mt-1 text-sm">{T.successDetails(topics, chapters, skipped)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className={buttonClass()}>
            {mnAdmin.nav.content}
          </Link>
          <button type="button" onClick={onRestart} className={buttonClass({ variant: "secondary" })}>
            {T.heading}
          </button>
        </div>
      </div>
    );
  }

  const plan = state.status === "preview" ? state.plan : undefined;

  return (
    <div className="space-y-8">
      <form action={action} className="space-y-5 rounded-2xl border border-line bg-surface p-6">
        <input type="hidden" name="mode" value="preview" />
        <FormAlert message={state.status === "error" ? state.message : undefined} />
        <Field id="file" label={T.file}>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="block w-full text-sm text-ink-2 file:mr-4 file:rounded-lg file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:font-medium file:text-accent hover:file:bg-accent/15"
          />
        </Field>
        <Field id="csv" label={`${T.paste} (${T.orPaste})`}>
          <TextArea id="csv" rows={6} defaultValue={state.csv ?? ""} spellCheck={false} className="font-mono text-xs" />
        </Field>
        <SubmitButton pendingLabel={T.checking}>{T.check}</SubmitButton>
      </form>

      {plan && (
        <section aria-labelledby="summary-heading" className="space-y-5">
          <h2 id="summary-heading" className="font-display text-2xl font-semibold text-ink">
            {T.summaryHeading}
          </h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            <li className="rounded-lg bg-success-soft px-3 py-1.5 font-medium text-success">{T.counts.lessons(plan.summary.newLessons)}</li>
            <li className="rounded-lg bg-surface-2 px-3 py-1.5 text-ink-2">{T.counts.topics(plan.summary.newTopics)}</li>
            <li className="rounded-lg bg-surface-2 px-3 py-1.5 text-ink-2">{T.counts.chapters(plan.summary.newChapters)}</li>
            {plan.summary.skipped > 0 && (
              <li className="rounded-lg bg-surface-2 px-3 py-1.5 text-ink-2">{T.counts.skipped(plan.summary.skipped)}</li>
            )}
            {plan.summary.errors > 0 && (
              <li className="rounded-lg bg-danger-soft px-3 py-1.5 font-medium text-danger">{T.counts.errors(plan.summary.errors)}</li>
            )}
          </ul>

          {plan.summary.errors > 0 ? (
            <FormAlert message={T.hasErrors} />
          ) : plan.canCommit ? (
            <form action={action}>
              <input type="hidden" name="mode" value="commit" />
              <input type="hidden" name="csv" value={state.csv ?? ""} />
              <SubmitButton pendingLabel={T.committing}>
                {T.commit} — {T.counts.lessons(plan.summary.newLessons)}
              </SubmitButton>
            </form>
          ) : (
            <FormAlert message={T.nothingToImport} />
          )}

          <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-line bg-surface-2 text-xs text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">{T.table.line}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{T.table.topic}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{T.table.chapter}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{T.table.lesson}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{T.table.video}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{T.table.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {plan.rows.map((row) => (
                  <tr key={row.line} className="align-top">
                    <td className="px-3 py-2 tabular-nums text-ink-3">{row.line}</td>
                    <td className="px-3 py-2 text-ink">{row.topicTitle}</td>
                    <td className="px-3 py-2 text-ink">{row.chapterTitle}</td>
                    <td className="px-3 py-2 text-ink">{row.lessonTitle}</td>
                    <td className="px-3 py-2 font-mono text-xs text-ink-2">{row.videoId ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLE[row.status]}`}>{T.status[row.status]}</span>
                      {[...row.errors, ...row.warnings].map((m) => (
                        <p key={m} className={`mt-1 text-xs ${row.status === "error" ? "text-danger" : "text-ink-3"}`}>
                          {m}
                        </p>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
