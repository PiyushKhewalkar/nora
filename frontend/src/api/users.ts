import { get, post, put } from "./client";
import type { User, UserCreate, UserUpdate } from "../types/api";

interface Envelope<T> {
  data: T;
  message?: string;
}

interface CreatedResponse {
  id: string;
  message: string;
}

/**
 * The single V1 user, identified by server config rather than by auth.
 *
 * Throws an ApiError with status 404 when DEFAULT_USER_ID is unset or points
 * at a missing record. Treat that as "no profile yet", not as a crash.
 */
export async function getCurrentUser(): Promise<User> {
  const response = await get<Envelope<User>>("/users/me");
  return response.data;
}

export async function getUser(id: string): Promise<User> {
  const response = await get<Envelope<User>>(`/users/${id}`);
  return response.data;
}

/** Returns the new user's id. Daily targets are derived server-side. */
export async function createUser(user: UserCreate): Promise<string> {
  const response = await post<CreatedResponse>("/users/", user);
  return response.id;
}

/** Partial update. The server recomputes all four targets from the merged state. */
export async function updateUser(id: string, changes: UserUpdate): Promise<void> {
  await put<{ message: string }>(`/users/${id}`, changes);
}
