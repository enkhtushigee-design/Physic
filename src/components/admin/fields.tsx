import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const control =
  "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-3 transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 aria-[invalid=true]:border-danger";

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: boolean) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type Common = { id: string; error?: string; hasHint?: boolean };

export function TextInput({ id, error, hasHint, className = "", ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hasHint)}
      className={`${control} border-line-strong h-11 ${className}`}
      {...props}
    />
  );
}

export function TextArea({ id, error, hasHint, className = "", ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hasHint)}
      className={`${control} border-line-strong min-h-28 leading-relaxed ${className}`}
      {...props}
    />
  );
}

export function Select({ id, error, hasHint, children, ...props }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hasHint)}
      className={`${control} border-line-strong h-11`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ id, label, hint, defaultChecked }: { id: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1 size-4.5 rounded border-line-strong accent-[var(--accent)]"
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-xs text-ink-3">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

export function FormAlert({ message, tone = "error" }: { message?: string; tone?: "error" | "success" }) {
  if (!message) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        tone === "error" ? "border-danger/30 bg-danger-soft text-danger" : "border-success/30 bg-success-soft text-success"
      }`}
    >
      {message}
    </p>
  );
}
