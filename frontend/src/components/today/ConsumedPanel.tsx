import { kcal } from "../../lib/format";
import type { Summary } from "../../types/api";

export function ConsumedPanel({ summary }: { summary: Summary }) {
  const consumed = summary.consumed.calories;
  const target = summary.targets?.calories ?? null;
  const remaining = summary.remaining?.calories ?? null;

  // Clamp only the bar; the number itself must still read as over.
  const percent = target && target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const over = remaining !== null && remaining < 0;

  return (
    <section className="px-5 py-6">
      <p className="text-xs tracking-wide text-muted uppercase">Consumed</p>

      <p className="mt-1 flex items-baseline gap-2">
        <span className="font-heading text-5xl leading-none">{kcal(consumed)}</span>
        <span className="text-sm text-muted">kcal</span>
      </p>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full ${over ? "bg-accent-deep" : "bg-accent"}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 flex justify-between text-sm">
        <span className="text-muted">{target === null ? "No target set" : `of ${kcal(target)} kcal`}</span>
        <span className={over ? "text-accent-deep" : "text-ink"}>
          {remaining === null
            ? "—"
            : over
              ? `${kcal(Math.abs(remaining))} over`
              : `${kcal(remaining)} left`}
        </span>
      </p>
    </section>
  );
}
