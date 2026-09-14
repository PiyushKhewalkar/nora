import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "../api/client";
import { listMeals } from "../api/meals";
import { getSummary } from "../api/summary";
import type { Meal, Summary } from "../types/api";

export type DayStatus = "loading" | "ready" | "error";

export interface UseDayResult {
  /** The day actually being shown. Null until the first load resolves. */
  date: string | null;
  summary: Summary | null;
  meals: Meal[];
  status: DayStatus;
  error: ApiError | null;
  /** True once loaded and nothing was logged. */
  isEmpty: boolean;
  reload: () => void;
}

/**
 * Loads everything the Today screen needs for one calendar day.
 *
 * Summary and meals are fetched together and share one status, because the
 * screen has no useful state where one has arrived and the other has not.
 *
 * Pass `null` for today. Deliberately: the server owns the notion of "today"
 * (it applies the configured TIMEZONE), so asking without a date avoids the
 * device and the server disagreeing about which day it is. The day the server
 * chose comes back as `date`, which is what the prev/next controls step from.
 */
export function useDay(requestedDate: string | null): UseDayResult {
  const [date, setDate] = useState<string | null>(requestedDate);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [status, setStatus] = useState<DayStatus>("loading");
  const [error, setError] = useState<ApiError | null>(null);
  const [nonce, setNonce] = useState(0);

  // Guards against a slow response for an old date overwriting a newer one
  // when the user taps through days quickly.
  const activeRequest = useRef(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const requestId = ++activeRequest.current;
    const controller = new AbortController();

    setStatus("loading");
    setError(null);

    const load = async () => {
      try {
        const [summaryResult, mealsResult] = await Promise.all([
          getSummary(requestedDate ?? undefined, { signal: controller.signal }),
          listMeals(requestedDate ?? undefined, { signal: controller.signal }),
        ]);

        if (requestId !== activeRequest.current) return;

        setSummary(summaryResult);
        setMeals(mealsResult);
        setDate(summaryResult.date);
        setStatus("ready");
      } catch (caught) {
        if (requestId !== activeRequest.current) return;

        const apiError =
          caught instanceof ApiError
            ? caught
            : new ApiError("server", "Unexpected failure.", null);

        // An abort is our own doing, not a failure to show the user.
        if (apiError.kind === "canceled") return;

        setError(apiError);
        setStatus("error");
      }
    };

    void load();
    return () => controller.abort();
  }, [requestedDate, nonce]);

  return {
    date,
    summary,
    meals,
    status,
    error,
    isEmpty: status === "ready" && meals.length === 0,
    reload,
  };
}
