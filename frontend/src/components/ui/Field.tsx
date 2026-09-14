import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

const CONTROL =
  "w-full rounded-md border border-divider bg-bg px-3 py-2 text-ink " +
  "focus:border-accent focus:outline-none";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-xs text-muted">{children}</span>;
}

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-1 text-xs text-accent-deep">
      {children}
    </p>
  );
}

interface TextProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function TextField({ invalid, className = "", ...rest }: TextProps) {
  return (
    <input
      type="text"
      {...rest}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} ${invalid ? "border-accent-deep" : ""} ${className}`}
    />
  );
}

/**
 * Kept as a text input with a numeric keypad rather than type="number":
 * type="number" silently reports an empty string for invalid text, which
 * hides typos, and the spinners are useless on a phone.
 */
export function NumberField({ invalid, className = "", ...rest }: TextProps) {
  return (
    <input
      type="text"
      inputMode="decimal"
      {...rest}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} tabular-nums ${invalid ? "border-accent-deep" : ""} ${className}`}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ className = "", children, ...rest }: SelectProps) {
  return (
    <select {...rest} className={`${CONTROL} ${className}`}>
      {children}
    </select>
  );
}
