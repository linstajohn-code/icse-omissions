"use client";

/**
 * Reusable delete-confirmation form for admin soft-delete operations.
 *
 * Uses useActionState so the change_reason validation error is shown inline
 * without a full page reload.
 */
import { useActionState } from "react";
import type { ActionState } from "@/lib/admin-actions";

interface Props {
  /** The server action to invoke on submit */
  // reason: server actions are typed as (state, formData) => Promise<ActionState>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (prevState: ActionState, formData: FormData) => Promise<any>;
  /** Hidden input fields to include (entity ids, subject id, etc.) */
  hiddenFields: Record<string, string>;
  cancelHref: string;
  submitLabel?: string;
}

export function DeleteConfirmForm({
  action,
  hiddenFields,
  cancelHref,
  submitLabel = "Confirm Delete",
}: Props) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden entity ids */}
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {/* Change reason */}
      <div className="space-y-1.5">
        <label htmlFor="change_reason" className="text-sm font-medium block">
          Change Reason{" "}
          <span className="text-destructive" aria-label="required">*</span>
        </label>
        <input
          id="change_reason"
          name="change_reason"
          type="text"
          required
          placeholder="e.g. Topic was erroneously included — not in current CISCE circular"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground">
          Required — recorded in the audit log.
        </p>
      </div>

      {/* Error */}
      {state?.error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-destructive text-destructive-foreground px-5 py-2 text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Processing…" : submitLabel}
        </button>
        <a
          href={cancelHref}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
