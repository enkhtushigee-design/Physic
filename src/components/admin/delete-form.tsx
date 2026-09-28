"use client";

import { useActionState } from "react";
import { deleteAction, type FormState } from "@/app/admin/actions";
import type { ContentTable } from "@/lib/content/types";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { FormAlert } from "./fields";
import { SubmitButton } from "./submit-button";

const CONFIRM: Record<ContentTable, string> = {
  topics: mnAdmin.confirmDelete.topic,
  chapters: mnAdmin.confirmDelete.chapter,
  lessons: mnAdmin.confirmDelete.lesson,
};

export function DeleteForm({ table, id }: { table: ContentTable; id: string }) {
  const [state, action] = useActionState(deleteAction, { status: "idle" } as FormState);
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(CONFIRM[table])) event.preventDefault();
      }}
      className="space-y-4"
    >
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-ink-2">{CONFIRM[table]}</p>
      <FormAlert message={state.status === "error" ? state.message : undefined} />
      <SubmitButton variant="danger" pendingLabel={mnAdmin.actions.saving}>
        {mnAdmin.actions.delete}
      </SubmitButton>
    </form>
  );
}
