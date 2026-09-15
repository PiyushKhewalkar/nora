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

/**
 * Most endpoints answer in well under a second, but a free-tier host sleeps
 * when idle and takes roughly a minute to wake. A short timeout would fail
 * every first request of the day. Lower this if the backend stops sleeping.
 */
export const DEFAULT_TIMEOUT_MS = 75_000;

/** Analysis runs 10-20s server-side, plus a possible cold start ahead of it. */
export const ANALYSIS_TIMEOUT_MS = 90_000;

/* ------------------------------------------------------------------ */
/* Session token                                                        */
/* ------------------------------------------------------------------ */

const TOKEN_KEY = "nora.token";

/**
 * Held in localStorage rather than an httpOnly cookie.
 *
 * The API is on a different site to the app (onrender.com vs netlify.app), so
 * a cookie would be cross-site: SameSite=None, credentialed CORS, CSRF
 * handling, and squarely in the path of browsers restricting third-party
 * cookies. The trade is XSS exposure, acceptable here only because the app
 * renders no user-supplied HTML and loads no third-party scripts.
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null; // private mode, blocked storage
  }
}

export function setToken(token: string | null): void {
  try {
    if (token === null) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable; the session simply will not persist */
  }
}

/** Notified when the server rejects our token, so the app can show the login screen. */
let onUnauthenticated: (() => void) | null = null;
export function setUnauthenticatedHandler(handler: (() => void) | null): void {
  onUnauthenticated = handler;
}

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

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    // An expired or revoked token must drop the session rather than leaving
    // the app retrying forever with credentials the server no longer accepts.
    if (apiError.status === 401) {
      setToken(null);
      onUnauthenticated?.();
    }
    return Promise.reject(apiError);
  },
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
