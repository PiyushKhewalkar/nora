import { useState } from "react";

import { ApiError } from "../api/client";
import { createMeal, deleteMeal, updateMeal } from "../api/meals";
import { EditorHeader } from "../components/editor/EditorHeader";
import { FoodItemRow } from "../components/editor/FoodItemRow";
import { MealTypePicker } from "../components/editor/MealTypePicker";
import { RunningTotal } from "../components/editor/RunningTotal";
import { SaveFailedNotice } from "../components/editor/SaveFailedNotice";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useMealDraft, type DraftInit } from "../hooks/useMealDraft";

interface Props {
  initial: DraftInit;
  /** Context line shown when arriving from an analysis. */
  analysisNote?: string | null;
  onSaved: () => void;
  onDiscard: () => void;
  onDeleted: () => void;
}

type Pending = "discard" | "delete" | null;

/**
 * Serves all three entry points — an analysis result, a blank manual meal, and
 * an already-logged meal being edited. It distinguishes them only by whether
 * `initial.id` is present; nothing here knows where the draft came from.
 */
export function EditorScreen({ initial, analysisNote, onSaved, onDiscard, onDeleted }: Props) {
  const draft = useMealDraft(initial);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!draft.validate()) return;

    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        foods: draft.toFoods(),
        // validate() guarantees this is set.
        meal_type: draft.mealType!,
        image_url: draft.imageUrl,
      };

      if (draft.id) {
        await updateMeal(draft.id, payload);
      } else {
        await createMeal(payload);
      }
      onSaved();
    } catch (caught) {
      setSaveError(
        caught instanceof ApiError ? caught.message : "The server did not accept the meal.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!draft.id) return;
    setBusy(true);
    try {
      await deleteMeal(draft.id);
      onDeleted();
    } catch (caught) {
      setSaveError(
        caught instanceof ApiError ? caught.message : "Could not delete the meal.",
      );
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  const itemCountLabel =
    draft.items.length === 0
      ? "none"
      : `${draft.items.length} item${draft.items.length === 1 ? "" : "s"}`;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <EditorHeader
        title={draft.isExisting ? "Edit meal" : "New meal"}
        saveLabel={draft.isExisting ? "Save changes" : "Save"}
        saving={saving}
        onDiscard={() => setPending("discard")}
        onSave={save}
      />

      <main className="flex-1 space-y-5 px-5 py-5">
        {analysisNote && (
          <p className="rounded-md border border-divider bg-accent-soft px-3 py-2 text-sm">
            {analysisNote}
          </p>
        )}

        {draft.imageUrl && (
          <div className="mx-auto w-40 overflow-hidden rounded-md border-4 border-surface outline outline-divider">
            <img
              src={draft.imageUrl}
              alt="The meal"
              className="aspect-square w-full max-w-full object-cover"
            />
          </div>
        )}

        <MealTypePicker
          value={draft.mealType}
          onChange={draft.setMealType}
          error={draft.mealTypeError}
        />

        <section>
          <div className="mb-2 flex items-baseline justify-between border-b border-divider pb-2">
            <h2 className="font-heading text-lg">Food items</h2>
            <span className="text-xs text-muted">{itemCountLabel}</span>
          </div>

          {draft.items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-heading text-base">No items yet</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                Add each food on the plate. A meal can be saved with the items you enter by
                hand.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {draft.items.map((item) => (
                <FoodItemRow
                  key={item.key}
                  item={item}
                  errors={draft.itemErrors[item.key]}
                  onChange={draft.setField}
                  onRemove={draft.removeItem}
                />
              ))}
            </ul>
          )}

          <Button variant="secondary" block className="mt-3" onClick={draft.addItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add a food item
          </Button>

          {draft.showErrors && !draft.hasItems && (
            <p role="alert" className="mt-2 text-xs text-accent-deep">
              Add at least one food item before saving.
            </p>
          )}
        </section>

        <RunningTotal totals={draft.totals} />

        {saveError && <SaveFailedNotice message={saveError} onRetry={save} />}

        {draft.isExisting && (
          <Button variant="ghost" block onClick={() => setPending("delete")}>
            Delete this meal
          </Button>
        )}
      </main>

      <ConfirmDialog
        open={pending === "discard"}
        title="Discard this meal?"
        body="The items you entered will be lost. The photo stays stored."
        confirmLabel="Discard"
        onConfirm={onDiscard}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending === "delete"}
        title="Delete this meal?"
        body="It will be removed from the day. This cannot be undone."
        confirmLabel="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
