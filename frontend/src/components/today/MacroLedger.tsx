import { grams, kcal } from "../../lib/format";
import { MACRO_KEYS, type MacroKey, type Summary } from "../../types/api";

const LABELS: Record<MacroKey, string> = {
  calories: "Calories",
  protein: "Protein",
  carbs: "Carbs",
  fats: "Fats",
};

function value(key: MacroKey, amount: number): string {
  return key === "calories" ? kcal(amount) : grams(amount);
}

export function MacroLedger({ summary }: { summary: Summary }) {
  const rows = MACRO_KEYS.map((key) => {
    const remaining = summary.remaining?.[key] ?? null;
    return {
      key,
      label: LABELS[key],
      consumed: value(key, summary.consumed[key]),
      target: summary.targets ? value(key, summary.targets[key]) : "—",
      remaining: remaining === null ? "—" : value(key, Math.abs(remaining)),
      over: remaining !== null && remaining < 0,
    };
  });

  return (
    <section className="px-5">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-divider text-left text-xs text-muted uppercase">
            <th className="py-2 font-normal">Macro</th>
            <th className="py-2 text-right font-normal">Consumed</th>
            <th className="py-2 text-right font-normal">Target</th>
            <th className="py-2 text-right font-normal">Remaining</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-divider/60">
              <td className="py-2.5">{row.label}</td>
              <td className="py-2.5 text-right tabular-nums">{row.consumed}</td>
              <td className="py-2.5 text-right tabular-nums text-muted">{row.target}</td>
              <td className="py-2.5 text-right tabular-nums">
                <span className={row.over ? "text-accent-deep" : ""}>{row.remaining}</span>
                {row.over && (
                  <span className="ml-1 text-xs text-accent-deep">over</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">Protein, carbs and fats in grams.</p>
    </section>
  );
}
