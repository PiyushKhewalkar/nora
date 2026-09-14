import { grams, kcal } from "../../lib/format";
import type { User } from "../../types/api";

interface Props {
  user: User | null;
  /** The form no longer matches what produced these numbers. */
  stale: boolean;
}

export function TargetsPanel({ user, stale }: Props) {
  const status = !user ? "not saved yet" : stale ? "will update when you save" : "from your saved profile";

  const cells = user
    ? [
        { label: "kcal", value: kcal(user.daily_calorie_target) },
        { label: "Prot", value: grams(user.daily_protein_target) },
        { label: "Carb", value: grams(user.daily_carbs_target) },
        { label: "Fat", value: grams(user.daily_fat_target) },
      ]
    : [
        { label: "kcal", value: "—" },
        { label: "Prot", value: "—" },
        { label: "Carb", value: "—" },
        { label: "Fat", value: "—" },
      ];

  return (
    <section className="rounded-md border border-divider bg-surface/60 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading text-lg">Daily targets</h2>
        <span className="text-xs text-muted">{status}</span>
      </div>
      <div className={`mt-3 grid grid-cols-4 gap-2 text-center ${stale ? "opacity-50" : ""}`}>
        {cells.map((cell) => (
          <div key={cell.label}>
            <div className="font-heading text-xl tabular-nums">{cell.value}</div>
            <div className="text-xs text-muted">{cell.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Derived by the server from the values above. Never entered directly.
      </p>
    </section>
  );
}
