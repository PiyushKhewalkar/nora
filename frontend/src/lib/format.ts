import type { Meal, Macros } from "../types/api";

/** YYYY-MM-DD in the browser's local zone. */
export function localDateString(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Shift a YYYY-MM-DD string by whole days without touching UTC. */
export function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(y, m - 1, d + days);
  return localDateString(next);
}

export function isToday(date: string): boolean {
  return date === localDateString();
}

export function dateLabel(date: string): string {
  if (isToday(date)) return "Today";
  if (date === shiftDate(localDateString(), -1)) return "Yesterday";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function mealCountLabel(count: number): string {
  if (count === 0) return "Nothing logged";
  return count === 1 ? "1 meal" : `${count} meals`;
}

/** Whole numbers for calories, one decimal for grams, thousands separated. */
export function kcal(value: number): string {
  return Math.round(value).toLocaleString();
}

export function grams(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString();
}

export function mealTime(iso: string): string {
  // The API sends UTC without a zone suffix; mark it so the browser converts.
  const stamp = /[Zz]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  return new Date(stamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function mealTypeLabel(type: Meal["meal_type"]): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/** "20.9 P · 109.5 C · 14.1 F" */
export function macroLine(m: Pick<Macros, "protein" | "carbs" | "fats">): string {
  return `${grams(m.protein)} P · ${grams(m.carbs)} C · ${grams(m.fats)} F`;
}
