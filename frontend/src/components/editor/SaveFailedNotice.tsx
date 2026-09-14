import { Button } from "../ui/Button";

interface Props {
  message: string;
  onRetry: () => void;
}

export function SaveFailedNotice({ message, onRetry }: Props) {
  return (
    <div role="alert" className="rounded-md border border-accent-deep/40 bg-accent-soft p-4">
      <p className="font-heading text-base text-accent-deep">Save failed</p>
      <p className="mt-1 text-sm text-ink">{message}</p>
      <p className="mt-1 text-sm text-muted">
        Nothing was lost — the items above are still here.
      </p>
      <Button variant="primary" className="mt-3" onClick={onRetry}>
        Try saving again
      </Button>
    </div>
  );
}
