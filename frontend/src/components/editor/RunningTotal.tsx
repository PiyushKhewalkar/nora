import { grams, kcal } from "../../lib/format";
import type { MacroKey } from "../../types/api";

export function RunningTotal({ totals }: { totals: Record<MacroKey, number> }) {
  const cells = [
    { label: "kcal", value: kcal(totals.calories) },
    { label: "Prot", value: grams(totals.protein) },
    { label: "Carb", value: grams(totals.carbs) },
    { label: "Fat", value: grams(totals.fats) },
  ];

  return (
    <section className="rounded-md border border-divider bg-surface/60 p-4">
      <p className="text-xs tracking-wide text-muted uppercase">Running total</p>
      <div className="mt-2 grid grid-cols-4 gap-2 text-center">
        {cells.map((cell) => (
          <div key={cell.label}>
            <div className="font-heading text-xl tabular-nums">{cell.value}</div>
            <div className="text-xs text-muted">{cell.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Display only. The server recomputes totals on save and its values are authoritative.
      </p>
    </section>
  );
}
