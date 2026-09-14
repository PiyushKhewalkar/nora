import { Button } from "../ui/Button";

/**
 * Shown when the summary comes back with null targets. Consumed values are
 * still valid, so this explains the gap rather than blocking the screen.
 */
export function NoProfileBanner({ onSetUp }: { onSetUp: () => void }) {
  return (
    <div className="mx-5 flex gap-3 rounded-md border border-divider bg-accent-soft p-4">
      <span className="font-heading text-lg text-accent-deep" aria-hidden>
        §
      </span>
      <div>
        <p className="text-sm text-ink">
          No profile configured. Targets and remaining are unavailable; consumed values are
          unaffected.
        </p>
        <Button variant="ghost" className="mt-1 text-sm" onClick={onSetUp}>
          Set up a profile →
        </Button>
      </div>
    </div>
  );
}
