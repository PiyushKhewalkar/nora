/**
 * Mirrors the Nora backend contract.
 *
 * These types are hand-kept in sync with the FastAPI models. If an endpoint
 * changes shape, change it here first and let the compiler find the callers.
 */

/* ------------------------------------------------------------------ */
/* Closed vocabularies                                                  */
/* ------------------------------------------------------------------ */

export const MEAL_UNITS = ["g", "ml", "piece", "serving", "cup", "tbsp", "tsp"] as const;
export type MealUnit = (typeof MEAL_UNITS)[number];

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const SEXES = ["male", "female", "prefer_not_to_say"] as const;
export type Sex = (typeof SEXES)[number];

export const GOALS = ["lose_weight", "maintain_weight", "gain_weight"] as const;
export type Goal = (typeof GOALS)[number];

export const ACTIVITY_LEVELS = [
  "sedentary",
  "lightly_active",
  "moderately_active",
  "very_active",
  "extra_active",
] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

/** The four macros, in the order the UI displays them. */
export const MACRO_KEYS = ["calories", "protein", "carbs", "fats"] as const;
export type MacroKey = (typeof MACRO_KEYS)[number];

/* ------------------------------------------------------------------ */
/* Meals                                                                */
/* ------------------------------------------------------------------ */

export interface Food {
  name: string;
  quantity: number;
  meal_unit: MealUnit;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  user_id: string;
  /** Null for meals entered by hand. */
  image_url: string | null;
  foods: Food[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meal_type: MealType;
  /** ISO 8601, UTC. */
  created_at: string;
}

/**
 * What the client may send. Note the absence of totals: the server computes
 * them from `foods` and ignores anything else. Used for both create and update.
 */
export interface MealCreate {
  foods: Food[];
  meal_type: MealType;
  image_url?: string | null;
}

/* ------------------------------------------------------------------ */
/* Capture flow                                                         */
/* ------------------------------------------------------------------ */

/** Phase 1 — fast, reports real byte progress. */
export interface UploadResult {
  image_url: string;
}

/** Phase 2 — slow (10-20s). `foods` may be empty; that is a success, not an error. */
export interface AnalysisResult {
  image_url: string;
  foods: Food[];
}

/* ------------------------------------------------------------------ */
/* Summary                                                              */
/* ------------------------------------------------------------------ */

export type Macros = Record<MacroKey, number>;

export interface Summary {
  /** The local calendar day, YYYY-MM-DD. */
  date: string;
  /** IANA zone the day boundaries were computed in. */
  timezone: string;
  meal_count: number;
  consumed: Macros;
  /** Null when no profile is configured. The UI must handle this. */
  targets: Macros | null;
  /** Null whenever `targets` is null. Values may be negative when over target. */
  remaining: Macros | null;
}

/* ------------------------------------------------------------------ */
/* Users                                                                */
/* ------------------------------------------------------------------ */

export interface UserCreate {
  name: string;
  age: number;
  sex: Sex;
  /** Centimetres. */
  height: number;
  /** Kilograms. */
  weight: number;
  goal: Goal;
  activity_level: ActivityLevel;
}

/**
 * A stored account. Every profile field is null between signing up and
 * completing onboarding, and the derived targets are null alongside them.
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  age: number | null;
  sex: Sex | null;
  height: number | null;
  weight: number | null;
  goal: Goal | null;
  activity_level: ActivityLevel | null;
  daily_calorie_target: number | null;
  daily_protein_target: number | null;
  daily_carbs_target: number | null;
  daily_fat_target: number | null;
  created_at: string;
}

/** Every field optional: the server merges and recomputes targets. */
export type UserUpdate = Partial<UserCreate>;

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/** Pull a meal's stored totals into the same shape as `Summary.consumed`. */
export function mealTotals(meal: Meal): Macros {
  return {
    calories: meal.total_calories,
    protein: meal.total_protein,
    carbs: meal.total_carbs,
    fats: meal.total_fats,
  };
}

/** Sum a draft's food list for display. The server's value wins on save. */
export function sumFoods(foods: Food[]): Macros {
  return foods.reduce<Macros>(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fats: acc.fats + f.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
}
