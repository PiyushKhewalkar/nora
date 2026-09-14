import { get } from "./client";
import type { Summary } from "../types/api";

/**
 * Consumed vs target vs remaining for one local calendar day.
 *
 * Unlike the meal endpoints this returns the object directly, with no
 * `{data: ...}` envelope.
 *
 * `targets` and `remaining` are null when no profile is configured. That is a
 * normal state, not an error — consumed values are still present and valid.
 */
export async function getSummary(
  date?: string,
  options: { signal?: AbortSignal } = {},
): Promise<Summary> {
  return get<Summary>("/summary/", {
    params: date ? { date } : undefined,
    signal: options.signal,
  });
}
