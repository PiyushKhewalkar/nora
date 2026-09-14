import { Button } from "../ui/Button";
import { kcal, macroLine, mealTime, mealTypeLabel } from "../../lib/format";
import { mealTotals, type Meal } from "../../types/api";

interface Props {
  meal: Meal;
  onOpen: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}

export function MealCard({ meal, onOpen, onDelete }: Props) {
  const totals = mealTotals(meal);

  return (
    <li className="flex items-stretch gap-3 border-b border-divider/60 py-3">
      <button
        onClick={() => onOpen(meal)}
        className="flex flex-1 items-center gap-3 text-left cursor-pointer"
      >
        {meal.image_url ? (
          <img
            src={meal.image_url}
            alt=""
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-md border border-divider object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-divider bg-surface">
            <span className="text-center text-[10px] leading-tight text-muted">
              Entered
              <br />
              by hand
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-base">{mealTypeLabel(meal.meal_type)}</span>
            <span className="text-xs text-muted">{mealTime(meal.created_at)}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg tabular-nums">{kcal(totals.calories)}</span>
            <span className="text-xs text-muted">kcal</span>
          </div>
          <p className="truncate text-xs text-muted">{macroLine(totals)}</p>
        </div>
      </button>

      <Button
        variant="icon"
        aria-label={`Delete ${mealTypeLabel(meal.meal_type)}`}
        className="self-center"
        onClick={() => onDelete(meal)}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
        </svg>
      </Button>
    </li>
  );
}
