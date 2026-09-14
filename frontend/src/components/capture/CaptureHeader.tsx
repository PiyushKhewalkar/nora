import { Button } from "../ui/Button";

export function CaptureHeader({ onCancel }: { onCancel: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-divider px-3 py-3">
      <Button variant="ghost" onClick={onCancel}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Cancel
      </Button>
      <span className="pr-2 text-xs text-muted">One image per meal</span>
    </header>
  );
}
