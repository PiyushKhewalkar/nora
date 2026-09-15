import { get, put } from "./client";
import type { User, UserUpdate } from "../types/api";

interface Envelope<T> {
  data: T;
  message?: string;
}

/** The authenticated user. Profile fields are null until onboarding completes. */
export async function getCurrentUser(): Promise<User> {
  const response = await get<Envelope<User>>("/users/me");
  return response.data;
}

/**
 * Partial update of the authenticated user. The server recomputes all four
 * targets from the merged state, and only once the profile is complete.
 *
 * There is no `/users/{id}` variant on purpose: an id in the path would let
 * any signed-in user address any other.
 */
export async function updateUser(changes: UserUpdate): Promise<void> {
  await put<{ message: string }>("/users/me", changes);
}
