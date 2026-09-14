import { Button } from "../ui/Button";
import { FieldError, FieldLabel, NumberField, Select, TextField } from "../ui/Field";
import { MEAL_UNITS, type MealUnit } from "../../types/api";
import type { DraftField, DraftItem, ItemErrors } from "../../hooks/useMealDraft";

interface Props {
  item: DraftItem;
  errors: ItemErrors | undefined;
  onChange: (key: string, field: DraftField, value: string) => void;
  onRemove: (key: string) => void;
}

const MACRO_FIELDS = [
  { field: "calories", label: "kcal" },
  { field: "protein", label: "Prot" },
  { field: "carbs", label: "Carb" },
  { field: "fats", label: "Fat" },
] as const;

export function FoodItemRow({ item, errors, onChange, onRemove }: Props) {
  const set = (field: DraftField) => (value: string) => onChange(item.key, field, value);

  return (
    <li className="rounded-md border border-divider p-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <TextField
            value={item.name}
            placeholder="Food name"
            aria-label="Food name"
            invalid={errors?.name}
            onChange={(e) => set("name")(e.target.value)}
          />
        </div>
        <Button
          variant="icon"
          aria-label={`Remove ${item.name || "item"}`}
          onClick={() => onRemove(item.key)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Button>
      </div>
      {errors?.name && <FieldError>A name is required.</FieldError>}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>Quantity</FieldLabel>
          <NumberField
            value={item.quantity}
            aria-label="Quantity"
            invalid={errors?.quantity}
            onChange={(e) => set("quantity")(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Unit</FieldLabel>
          <Select
            value={item.meal_unit}
            aria-label="Unit"
            onChange={(e) => set("meal_unit")(e.target.value as MealUnit)}
          >
            {MEAL_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {errors?.quantity && <FieldError>Quantity must be greater than zero.</FieldError>}

      <div className="mt-2 grid grid-cols-4 gap-2">
        {MACRO_FIELDS.map(({ field, label }) => (
          <div key={field}>
            <FieldLabel>{label}</FieldLabel>
            <NumberField
              value={item[field]}
              aria-label={label}
              className="px-2"
              onChange={(e) => set(field)(e.target.value)}
            />
          </div>
        ))}
      </div>
    </li>
  );
}
