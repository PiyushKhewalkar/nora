import { useCallback, useMemo, useState } from "react";

import type { Food, MacroKey, MealType, MealUnit } from "../types/api";

/**
 * Numeric fields are held as strings.
 *
 * A number-typed input cannot represent "being cleared" or "1." mid-typing
 * without producing NaN, so the draft keeps raw text and parses at the edges.
 * `toFoods()` is the only place strings become numbers.
 */
export interface DraftItem {
  /** Stable across reorders and removals; array index is not. */
  key: string;
  name: string;
  quantity: string;
  meal_unit: MealUnit;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

export type DraftNumericField = "quantity" | "calories" | "protein" | "carbs" | "fats";
export type DraftField = "name" | "meal_unit" | DraftNumericField;

export interface ItemErrors {
  name?: boolean;
  quantity?: boolean;
}

export interface DraftInit {
  /** Present when editing an already-logged meal. */
  id?: string;
  foods: Food[];
  mealType: MealType | null;
  imageUrl: string | null;
}

let counter = 0;
const nextKey = () => `item-${++counter}`;

function num(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDraftItem(food: Food): DraftItem {
  return {
    key: nextKey(),
    name: food.name,
    quantity: String(food.quantity),
    meal_unit: food.meal_unit,
    calories: String(food.calories),
    protein: String(food.protein),
    carbs: String(food.carbs),
    fats: String(food.fats),
  };
}

function emptyItem(): DraftItem {
  return {
    key: nextKey(),
    name: "",
    quantity: "",
    meal_unit: "g",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  };
}

export function useMealDraft(init: DraftInit) {
  const [items, setItems] = useState<DraftItem[]>(() => init.foods.map(toDraftItem));
  const [mealType, setMealType] = useState<MealType | null>(init.mealType);

  // Errors stay hidden until a save is attempted, so a half-typed row is not
  // scolded while the user is still filling it in.
  const [showErrors, setShowErrors] = useState(false);

  const setField = useCallback((key: string, field: DraftField, value: string) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    );
  }, []);

  const addItem = useCallback(() => {
    setItems((current) => [...current, emptyItem()]);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  /** Display only. The server recomputes from `foods` and its values win. */
  const totals = useMemo<Record<MacroKey, number>>(() => {
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + num(item.calories),
        protein: acc.protein + num(item.protein),
        carbs: acc.carbs + num(item.carbs),
        fats: acc.fats + num(item.fats),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );
  }, [items]);

  const itemErrors = useMemo<Record<string, ItemErrors>>(() => {
    const result: Record<string, ItemErrors> = {};
    for (const item of items) {
      const errors: ItemErrors = {};
      if (item.name.trim() === "") errors.name = true;
      if (!(num(item.quantity) > 0)) errors.quantity = true;
      if (errors.name || errors.quantity) result[item.key] = errors;
    }
    return result;
  }, [items]);

  const mealTypeError = mealType === null;
  const hasItems = items.length > 0;
  const isValid = hasItems && !mealTypeError && Object.keys(itemErrors).length === 0;

  const toFoods = useCallback(
    (): Food[] =>
      items.map((item) => ({
        name: item.name.trim(),
        quantity: num(item.quantity),
        meal_unit: item.meal_unit,
        calories: num(item.calories),
        protein: num(item.protein),
        carbs: num(item.carbs),
        fats: num(item.fats),
      })),
    [items],
  );

  return {
    id: init.id,
    isExisting: init.id !== undefined,
    imageUrl: init.imageUrl,

    items,
    mealType,
    totals,

    setField,
    addItem,
    removeItem,
    setMealType,

    /** Call before saving; returns whether the draft is submittable. */
    validate: () => {
      setShowErrors(true);
      return isValid;
    },
    showErrors,
    itemErrors: showErrors ? itemErrors : {},
    mealTypeError: showErrors && mealTypeError,
    isValid,
    hasItems,

    toFoods,
  };
}

export type MealDraft = ReturnType<typeof useMealDraft>;
