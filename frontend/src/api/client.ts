import axios, { AxiosError, type AxiosRequestConfig } from "axios";

/**
 * One axios instance for the whole app.
 *
 * Two things this file exists to guarantee:
 *   1. Every failure reaches the UI as an `ApiError`, never a raw AxiosError.
 *   2. Slow endpoints opt into a longer timeout explicitly, rather than the
 *      default being set high enough to hide a hung request.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  // Fail loudly at boot rather than producing requests to "/undefined/meals".
  throw new Error("VITE_API_URL is not set. Copy .env.example to .env.");
}

/** Most endpoints answer in well under a second. */
export const DEFAULT_TIMEOUT_MS = 15_000;

/** Analysis runs 10-20s server-side; give it room without being unbounded. */
export const ANALYSIS_TIMEOUT_MS = 60_000;

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { Accept: "application/json" },
});

/* ------------------------------------------------------------------ */
/* Errors                                                               */
/* ------------------------------------------------------------------ */

export type ApiErrorKind =
  | "network" // never reached the server
  | "timeout" // server took too long
  | "canceled" // we aborted it
  | "client" // 4xx
  | "server"; // 5xx

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;

  constructor(kind: ApiErrorKind, message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }

  /** True when retrying the identical request could plausibly succeed. */
  get retryable(): boolean {
    return this.kind === "network" || this.kind === "timeout" || this.kind === "server";
  }
}

/**
 * FastAPI returns `{detail: string}` for raised HTTPExceptions and
 * `{detail: [{loc, msg, ...}]}` for 422 validation failures. Flatten both.
 */
function readDetail(data: unknown, fallback: string): string {
  if (typeof data !== "object" || data === null) return fallback;
  const detail = (data as { detail?: unknown }).detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((d) => (typeof d === "object" && d !== null ? (d as { msg?: unknown }).msg : null))
      .filter((m): m is string => typeof m === "string");
    if (messages.length > 0) return messages.join(". ");
  }

  return fallback;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) {
    return new ApiError("canceled", "Request canceled.", null);
  }

  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError("timeout", "The server took too long to respond.", null);
    }

    const status = error.response?.status ?? null;

    if (status === null) {
      return new ApiError("network", "Could not reach the server.", null);
    }

    const kind: ApiErrorKind = status >= 500 ? "server" : "client";
    return new ApiError(kind, readDetail(error.response?.data, error.message), status);
  }

  return new ApiError("server", error instanceof Error ? error.message : "Unknown error.", null);
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);

/* ------------------------------------------------------------------ */
/* Request helpers                                                      */
/* ------------------------------------------------------------------ */

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.get<T>(url, config);
  return data;
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.post<T>(url, body, config);
  return data;
}

export async function put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.put<T>(url, body, config);
  return data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.delete<T>(url, config);
  return data;
}
