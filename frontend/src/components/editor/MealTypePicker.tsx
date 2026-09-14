import { FieldError } from "../ui/Field";
import { SegmentedControl } from "../ui/SegmentedControl";
import { MEAL_TYPES, type MealType } from "../../types/api";
import { mealTypeLabel } from "../../lib/format";

interface Props {
  value: MealType | null;
  onChange: (value: MealType) => void;
  error: boolean;
}

export function MealTypePicker({ value, onChange, error }: Props) {
  return (
    <section>
      <p className="mb-1 text-xs text-muted">Meal type · required</p>
      <SegmentedControl
        name="mealType"
        options={MEAL_TYPES}
        value={value}
        onChange={onChange}
        label={mealTypeLabel}
      />
      {error && <FieldError>Choose a meal type before saving.</FieldError>}
    </section>
  );
}
