import { Button } from "../ui/Button";
import type { CapturePhase } from "../../hooks/useAnalysis";

interface Props {
  phase: CapturePhase;
  uploadPercent: number;
  elapsedMs: number;
  previewUrl: string | null;
  onCancel: () => void;
}

type StageState = "pending" | "active" | "done";

const MARKS: Record<StageState, string> = { pending: "·", active: "→", done: "✓" };

/**
 * Two stages, not four.
 *
 * Only the upload reports real progress. The analysis is a single opaque
 * request, so it gets an honest indeterminate bar rather than invented
 * sub-steps that would drift out of sync with what is actually happening.
 */
export function AnalysisProgress({
  phase,
  uploadPercent,
  elapsedMs,
  previewUrl,
  onCancel,
}: Props) {
  const uploading = phase === "uploading";
  const seconds = Math.floor(elapsedMs / 1000);

  const stages: { state: StageState; label: string; note: string }[] = [
    {
      state: uploading ? "active" : "done",
      label: "Uploading the photo",
      note: uploading ? `${uploadPercent}%` : "done",
    },
    {
      state: uploading ? "pending" : "active",
      label: "Estimating the meal",
      note: uploading ? "waiting" : "ten to twenty seconds",
    },
  ];

  return (
    <div className="px-5 py-8">
      {previewUrl && (
        <div className="mx-auto mb-6 w-40 overflow-hidden rounded-md border-4 border-surface outline outline-divider">
          <img
            src={previewUrl}
            alt="The meal being analysed"
            className="aspect-square w-full max-w-full object-cover"
          />
        </div>
      )}

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface"
        role="progressbar"
        aria-label="Analysis progress"
        {...(uploading ? { "aria-valuenow": uploadPercent, "aria-valuemin": 0, "aria-valuemax": 100 } : {})}
      >
        <div
          className={`h-full rounded-full bg-accent ${uploading ? "" : "animate-pulse"}`}
          style={{ width: uploading ? `${uploadPercent}%` : "100%" }}
        />
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-heading text-lg">Analysing</span>
        <span className="text-sm text-muted tabular-nums">{seconds}s</span>
      </div>

      <ul className="mt-5 space-y-2">
        {stages.map((stage) => (
          <li key={stage.label} className="flex items-baseline gap-2 text-sm">
            <span
              aria-hidden
              className={`w-3 ${stage.state === "pending" ? "text-divider" : "text-accent"}`}
            >
              {MARKS[stage.state]}
            </span>
            <span className={stage.state === "pending" ? "text-muted" : "text-ink"}>
              {stage.label}
            </span>
            <span className="ml-auto text-xs text-muted tabular-nums">{stage.note}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-muted">
        Leaving this screen cancels the estimate. The photo is kept either way.
      </p>

      <Button variant="secondary" block className="mt-4" onClick={onCancel}>
        Cancel analysis
      </Button>
    </div>
  );
}
