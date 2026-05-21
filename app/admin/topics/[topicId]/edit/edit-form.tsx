"use client";

/**
 * Edit omission form — client component so we can use useActionState
 * to display inline validation errors without a page reload.
 */
import { useActionState } from "react";
import { updateOmission, type ActionState } from "@/lib/admin-actions";

const STATUS_OPTIONS = [
  { value: "omitted", label: "Omitted", hint: "Entire topic removed from syllabus" },
  { value: "partial", label: "Partial", hint: "Only a sub-section is removed" },
  { value: "included", label: "Included", hint: "Topic is fully included" },
] as const;

interface Props {
  omissionId: string;
  topicId: string;
  subjectId: string;
  currentStatus: string;
  currentNotesMd: string;
}

export function EditOmissionForm({
  omissionId,
  topicId,
  subjectId,
  currentStatus,
  currentNotesMd,
}: Props) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateOmission,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden fields */}
      <input type="hidden" name="omission_id" value={omissionId} />
      <input type="hidden" name="topic_id" value={topicId} />
      <input type="hidden" name="subject_id" value={subjectId} />

      {/* Status */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Status</legend>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="status"
                value={opt.value}
                defaultChecked={currentStatus === opt.value}
                className="mt-0.5"
              />
              <div>
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.hint}</div>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Notes */}
      <div className="space-y-1.5">
        <label htmlFor="notes_md" className="text-sm font-medium block">
          Notes{" "}
          <span className="text-muted-foreground font-normal">(Markdown, optional)</span>
        </label>
        <textarea
          id="notes_md"
          name="notes_md"
          rows={4}
          defaultValue={currentNotesMd}
          placeholder="e.g. Only sub-section 3.2 (Refraction) is omitted. Section 3.1 remains."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
      </div>

      {/* Change reason — required */}
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
          placeholder="e.g. Correcting misclassified status based on page 12 of 2026 circular"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground">
          Required — recorded in the audit log.
        </p>
      </div>

      {/* Error message */}
      {state?.error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving…" : "Save Changes"}
        </button>
        <a
          href={subjectId ? `/admin/subjects/${subjectId}` : "/admin/subjects"}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
