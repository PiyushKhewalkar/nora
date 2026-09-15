import { useCallback, useEffect, useState } from "react";

import { ApiError } from "../api/client";
import { getCurrentUser } from "../api/users";

export type GateStatus = "loading" | "needed" | "complete" | "error";

/**
 * Decides whether a signed-in user still has to onboard.
 *
 * Lives above the screens because the answer changes which screen renders at
 * all: a user without targets has nothing useful to see on Today, so sending
 * them there first shows an empty dashboard and asks them to find Profile.
 */
export function useProfileGate(authenticated: boolean) {
  const [status, setStatus] = useState<GateStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const user = await getCurrentUser();
      // Targets are the signal: the server only derives them once every
      // profile field is present, so this cannot disagree with the backend.
      setStatus(user.daily_calorie_target === null ? "needed" : "complete");
    } catch (caught) {
      // A 401 is handled globally by the interceptor; anything else is a real
      // failure and must not silently drop the user into an empty app.
      setError(caught instanceof ApiError ? caught.message : "Could not load your account.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!authenticated) {
      // Reset on sign-out so the next account is re-checked rather than
      // inheriting the previous user's answer.
      setStatus("loading");
      return;
    }
    void check();
  }, [authenticated, check]);

  return {
    status,
    error,
    /** Called by onboarding once targets exist, to avoid a second round trip. */
    markComplete: useCallback(() => setStatus("complete"), []),
    retry: check,
  };
}
