import { useCallback, useEffect, useState } from "react";

import { ApiError, getToken, setToken, setUnauthenticatedHandler } from "../api/client";
import { login as loginRequest, signup as signupRequest } from "../api/auth";

export type AuthMode = "login" | "signup";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean>(() => getToken() !== null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The interceptor clears the token on any 401; this keeps the UI in step.
  useEffect(() => {
    setUnauthenticatedHandler(() => setAuthenticated(false));
    return () => setUnauthenticatedHandler(null);
  }, []);

  const submit = useCallback(async (mode: AuthMode, email: string, password: string) => {
    setBusy(true);
    setError(null);
    try {
      const token = mode === "signup"
        ? await signupRequest(email, password)
        : await loginRequest(email, password);
      setToken(token);
      setAuthenticated(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAuthenticated(false);
  }, []);

  return { authenticated, busy, error, submit, logout, clearError: () => setError(null) };
}
