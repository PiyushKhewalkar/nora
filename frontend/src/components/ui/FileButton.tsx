import { useId, type ReactNode } from "react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

interface Props {
  onFile: (file: File) => void;
  /** Opens the rear camera directly on a phone instead of the gallery. */
  useCamera?: boolean;
  variant?: "primary" | "secondary";
  children: ReactNode;
}

/**
 * A file input styled as a button. The input stays a real <input type="file">
 * because that is what opens the camera on mobile; a <button> cannot.
 */
export function FileButton({ onFile, useCamera, variant = "secondary", children }: Props) {
  const id = useId();

  const style =
    variant === "primary"
      ? "border-accent text-accent hover:bg-accent-soft"
      : "border-divider text-ink hover:bg-surface";

  return (
    <label
      htmlFor={id}
      className={`inline-flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-4 py-3 font-heading transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${style}`}
    >
      {children}
      <input
        id={id}
        type="file"
        accept={ACCEPT}
        {...(useCamera ? { capture: "environment" as const } : {})}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          // Allow picking the same file twice in a row.
          event.target.value = "";
        }}
      />
    </label>
  );
}
