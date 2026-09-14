export function DaySkeleton() {
  return (
    <div className="px-5 py-8" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-surface"
            style={{ width: `${[70, 40, 90, 85, 60, 75][i]}%` }}
          />
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">Loading the day</p>
    </div>
  );
}
