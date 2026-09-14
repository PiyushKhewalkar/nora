import { ANALYSIS_TIMEOUT_MS, del, get, post, put } from "./client";
import type { AnalysisResult, Meal, MealCreate, UploadResult } from "../types/api";

/**
 * Several GET endpoints wrap their payload in `{data: ...}` while POST returns
 * `{id, message}`. That envelope stops here: callers get plain domain objects.
 */
interface Envelope<T> {
  data: T;
  message?: string;
}

interface CreatedResponse {
  id: string;
  message: string;
}

/* ------------------------------------------------------------------ */
/* Capture flow                                                         */
/* ------------------------------------------------------------------ */

/**
 * Phase 1 of the capture flow: store the photo.
 *
 * Fast relative to analysis, and the only step that can report real progress —
 * `onProgress` receives 0-100 as the bytes leave the device.
 *
 * Note we do not set Content-Type. Axios must generate the multipart boundary
 * itself; setting the header by hand omits it and the request will fail.
 */
export async function uploadMealImage(
  file: File,
  options: { onProgress?: (percent: number) => void; signal?: AbortSignal } = {},
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);

  return post<UploadResult>("/meals/upload", form, {
    signal: options.signal,
    onUploadProgress: (event) => {
      if (!options.onProgress || !event.total) return;
      options.onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
}

/**
 * Phase 2: estimate the foods in an already-uploaded photo. Runs 10-20s.
 *
 * An empty `foods` array is a successful response, not a failure: the model
 * found nothing it recognised as food. Route the user to manual entry rather
 * than showing an error.
 */
export async function analyseMealImage(
  imageUrl: string,
  options: { signal?: AbortSignal } = {},
): Promise<AnalysisResult> {
  return post<AnalysisResult>(
    "/meals/analyse",
    { image_url: imageUrl },
    { timeout: ANALYSIS_TIMEOUT_MS, signal: options.signal },
  );
}

/* ------------------------------------------------------------------ */
/* Meals                                                                */
/* ------------------------------------------------------------------ */

/** List meals, newest first. `date` is YYYY-MM-DD in the user's local zone. */
export async function listMeals(
  date?: string,
  options: { signal?: AbortSignal } = {},
): Promise<Meal[]> {
  const response = await get<Envelope<Meal[]>>("/meals/", {
    params: date ? { date } : undefined,
    signal: options.signal,
  });
  return response.data;
}

export async function getMeal(id: string): Promise<Meal> {
  const response = await get<Envelope<Meal>>(`/meals/${id}`);
  return response.data;
}

/** Returns the new meal's id. Totals are computed server-side from `foods`. */
export async function createMeal(meal: MealCreate): Promise<string> {
  const response = await post<CreatedResponse>("/meals/", meal);
  return response.id;
}

export async function updateMeal(id: string, meal: MealCreate): Promise<void> {
  await put<{ message: string }>(`/meals/${id}`, meal);
}

export async function deleteMeal(id: string): Promise<void> {
  await del<{ message: string }>(`/meals/${id}`);
}
