"use client";

import { useActionState } from "react";
import { Field, FormAlert, TextInput } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/submit-button";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { loginAction, type FormState } from "../actions";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, { status: "idle" } as FormState);
  return (
    <form action={action} className="space-y-5">
      <FormAlert message={state.status === "error" ? state.message : undefined} />
      <Field id="password" label={mnAdmin.login.password} error={state.fieldErrors?.password}>
        <TextInput id="password" type="password" autoComplete="current-password" required autoFocus error={state.fieldErrors?.password} />
      </Field>
      <SubmitButton pendingLabel={mnAdmin.actions.saving}>{mnAdmin.login.submit}</SubmitButton>
    </form>
  );
}
