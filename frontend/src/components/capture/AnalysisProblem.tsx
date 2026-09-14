import { Button } from "../ui/Button";
import { FileButton } from "../ui/FileButton";
import type { Problem } from "../../hooks/useAnalysis";

interface Props {
  problem: Problem;
  onRetry: () => void;
  onPickAnother: (file: File) => void;
  onManual: () => void;
}

export function AnalysisProblem({ problem, onRetry, onPickAnother, onManual }: Props) {
  return (
    <div className="px-5 py-10">
      <p className="text-xs tracking-wide text-accent-deep uppercase">{problem.kicker}</p>
      <h2 className="mt-1 font-heading text-2xl">{problem.title}</h2>
      <p className="mt-2 text-sm text-muted">{problem.body}</p>

      <div className="mt-8 space-y-2">
        {problem.retryable && (
          <Button variant="primary" block onClick={onRetry}>
            Retry analysis
          </Button>
        )}
        <FileButton onFile={onPickAnother}>Choose another photo</FileButton>
        <Button variant="ghost" block onClick={onManual}>
          Enter this meal by hand
        </Button>
      </div>
    </div>
  );
}
