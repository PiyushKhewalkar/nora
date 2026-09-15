import { useState } from "react";

import { Button } from "../components/ui/Button";
import { FieldError, FieldLabel, TextField } from "../components/ui/Field";
import type { AuthMode } from "../hooks/useAuth";

interface Props {
  busy: boolean;
  error: string | null;
  onSubmit: (mode: AuthMode, email: string, password: string) => void;
  onModeChange: () => void;
}

const MIN_PASSWORD = 8;

export function AuthScreen({ busy, error, onSubmit, onModeChange }: Props) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const emailInvalid = touched && !email.includes("@");
  const passwordInvalid = touched && password.length < MIN_PASSWORD;

  const submit = () => {
    setTouched(true);
    if (!email.includes("@") || password.length < MIN_PASSWORD) return;
    onSubmit(mode, email.trim(), password);
  };

  const swap = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setTouched(false);
    onModeChange();
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="font-heading text-3xl">Nora</h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "login" ? "Sign in to your meals." : "Create an account to start logging."}
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextField
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            invalid={emailInvalid}
            aria-label="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailInvalid && <FieldError>Enter a valid email address.</FieldError>}
        </div>

        <div>
          <FieldLabel>Password</FieldLabel>
          <TextField
            type="password"
            // Tells password managers whether to offer saving a new one.
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            invalid={passwordInvalid}
            aria-label="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordInvalid && (
            <FieldError>At least {MIN_PASSWORD} characters.</FieldError>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-accent-deep">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" block disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <button className="mt-6 cursor-pointer text-sm text-accent underline underline-offset-4" onClick={swap}>
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>

      {mode === "login" && (
        <p className="mt-6 text-xs text-muted">
          There is no password reset yet. If you forget it, the password has to be reset
          directly in the database.
        </p>
      )}
    </div>
  );
}
