import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "icon";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-heading cursor-pointer " +
  "transition-colors disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const VARIANTS: Record<Variant, string> = {
  primary:
    "px-4 py-2.5 rounded-md border border-accent text-accent bg-transparent hover:bg-accent-soft",
  secondary:
    "px-4 py-2.5 rounded-md border border-divider text-ink bg-transparent hover:bg-surface",
  ghost: "px-1 py-1 text-accent hover:underline underline-offset-4",
  icon: "h-9 w-9 rounded-md border border-divider text-ink hover:bg-surface",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  children?: ReactNode;
}

export function Button({ variant = "secondary", block, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`${BASE} ${VARIANTS[variant]} ${block ? "w-full" : ""} ${className}`}
    />
  );
}
