import { AnalysisProblem } from "../components/capture/AnalysisProblem";
import { AnalysisProgress } from "../components/capture/AnalysisProgress";
import { CaptureHeader } from "../components/capture/CaptureHeader";
import { PhotoPicker } from "../components/capture/PhotoPicker";
import { useAnalysis } from "../hooks/useAnalysis";
import type { AnalysisResult } from "../types/api";

interface Props {
  /** Fired on a successful estimate. `foods` may be empty. */
  onAnalysed: (result: AnalysisResult) => void;
  /** Continue to the editor by hand, carrying the photo if one was stored. */
  onManual: (imageUrl: string | null) => void;
  onCancel: () => void;
}

export function CaptureScreen({ onAnalysed, onManual, onCancel }: Props) {
  const analysis = useAnalysis(onAnalysed);

  const leave = () => {
    analysis.cancel();
    onCancel();
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <CaptureHeader onCancel={leave} />

      <main className="flex-1">
        {analysis.phase === "choosing" && <PhotoPicker onFile={analysis.start} />}

        {(analysis.phase === "uploading" || analysis.phase === "analysing") && (
          <AnalysisProgress
            phase={analysis.phase}
            uploadPercent={analysis.uploadPercent}
            elapsedMs={analysis.elapsedMs}
            previewUrl={analysis.previewUrl}
            onCancel={analysis.cancel}
          />
        )}

        {analysis.phase === "problem" && analysis.problem && (
          <AnalysisProblem
            problem={analysis.problem}
            onRetry={analysis.retry}
            onPickAnother={analysis.start}
            // The upload may have succeeded before analysis failed, so the
            // photo can still come along rather than being thrown away.
            onManual={() => onManual(analysis.imageUrl)}
          />
        )}
      </main>
    </div>
  );
}
