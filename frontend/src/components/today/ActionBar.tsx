import { Button } from "../ui/Button";

interface Props {
  onCapture: () => void;
  onManual: () => void;
}

export function ActionBar({ onCapture, onManual }: Props) {
  return (
    <div className="sticky bottom-0 flex gap-2 border-t border-divider bg-bg/95 px-5 py-3 backdrop-blur">
      <Button variant="primary" className="flex-1" onClick={onCapture}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M14.5 4h-5L8 6H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-4z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        Photograph
      </Button>
      <Button variant="secondary" onClick={onManual}>
        By hand
      </Button>
    </div>
  );
}
