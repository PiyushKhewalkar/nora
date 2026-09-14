import { MealCard } from "./MealCard";
import { Button } from "../ui/Button";
import type { Meal } from "../../types/api";

interface Props {
  meals: Meal[];
  onOpen: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
  onCapture: () => void;
}

export function MealList({ meals, onOpen, onDelete, onCapture }: Props) {
  return (
    <section className="px-5 pt-6">
      <div className="flex items-baseline justify-between border-b border-divider pb-2">
        <h2 className="font-heading text-lg">Meals</h2>
        <span className="text-xs text-muted">Newest first</span>
      </div>

      {meals.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-heading text-lg">Nothing logged yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
            Photograph a meal as you eat it, or enter one by hand.
          </p>
          <Button variant="primary" className="mt-4" onClick={onCapture}>
            Photograph a meal
          </Button>
        </div>
      ) : (
        <ul>
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onOpen={onOpen} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}
