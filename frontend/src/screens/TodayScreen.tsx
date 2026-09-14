import { useState } from "react";

import { ApiError } from "../api/client";
import { deleteMeal } from "../api/meals";
import { ActionBar } from "../components/today/ActionBar";
import { ConsumedPanel } from "../components/today/ConsumedPanel";
import { DayHeader } from "../components/today/DayHeader";
import { DaySkeleton } from "../components/today/DaySkeleton";
import { MacroLedger } from "../components/today/MacroLedger";
import { MealList } from "../components/today/MealList";
import { NoProfileBanner } from "../components/today/NoProfileBanner";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useDay } from "../hooks/useDay";
import { mealTypeLabel, shiftDate } from "../lib/format";
import type { Meal } from "../types/api";

interface Props {
  onCapture: () => void;
  onManual: () => void;
  onOpenMeal: (meal: Meal) => void;
  onProfile: () => void;
}

export function TodayScreen({ onCapture, onManual, onOpenMeal, onProfile }: Props) {
  // null means "today" — the server resolves it using the configured timezone.
  const [requestedDate, setRequestedDate] = useState<string | null>(null);
  const { date, summary, meals, status, error, reload } = useDay(requestedDate);

  const [pendingDelete, setPendingDelete] = useState<Meal | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const step = (days: number) => {
    if (!date) return;
    setRequestedDate(shiftDate(date, days));
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMeal(pendingDelete.id);
      setPendingDelete(null);
      reload();
    } catch (caught) {
      setDeleteError(
        caught instanceof ApiError ? caught.message : "Could not delete the meal.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <DayHeader
        date={date}
        mealCount={summary?.meal_count ?? 0}
        onPrevDay={() => step(-1)}
        onNextDay={() => step(1)}
        onProfile={onProfile}
      />

      <main className="flex-1">
        {status === "loading" && <DaySkeleton />}

        {status === "error" && (
          <div className="px-5 py-12 text-center">
            <p className="font-heading text-lg">Could not load the day</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
              {error?.message ?? "Something went wrong."}
            </p>
            {error?.retryable !== false && (
              <Button variant="primary" className="mt-4" onClick={reload}>
                Try again
              </Button>
            )}
          </div>
        )}

        {status === "ready" && summary && (
          <>
            <ConsumedPanel summary={summary} />
            {summary.targets === null && <NoProfileBanner onSetUp={onProfile} />}
            <MacroLedger summary={summary} />
            <MealList
              meals={meals}
              onOpen={onOpenMeal}
              onDelete={(meal) => {
                setDeleteError(null);
                setPendingDelete(meal);
              }}
              onCapture={onCapture}
            />
            {deleteError && (
              <p className="px-5 pt-3 text-sm text-accent-deep">{deleteError}</p>
            )}
            <div className="h-6" />
          </>
        )}
      </main>

      <ActionBar onCapture={onCapture} onManual={onManual} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this meal?"
        body={
          pendingDelete
            ? `${mealTypeLabel(pendingDelete.meal_type)} will be removed from the day. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
