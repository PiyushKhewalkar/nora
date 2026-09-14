import { Button } from "../ui/Button";
import { dateLabel, isToday, mealCountLabel } from "../../lib/format";

interface Props {
  date: string | null;
  mealCount: number;
  onPrevDay: () => void;
  onNextDay: () => void;
  onProfile: () => void;
}

export function DayHeader({ date, mealCount, onPrevDay, onNextDay, onProfile }: Props) {
  // Nothing after today exists to look at.
  const atToday = date === null || isToday(date);

  return (
    <header className="border-b border-divider">
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="font-heading text-2xl">Nora</span>
        <Button variant="icon" aria-label="Profile" onClick={onProfile}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Button>
      </div>

      <div className="flex items-center justify-between px-3 py-4">
        <Button variant="ghost" aria-label="Previous day" onClick={onPrevDay}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>

        <div className="text-center">
          <div className="font-heading text-lg">{date ? dateLabel(date) : "…"}</div>
          <div className="text-xs text-muted">{mealCountLabel(mealCount)}</div>
        </div>

        <Button variant="ghost" aria-label="Next day" onClick={onNextDay} disabled={atToday}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </div>
    </header>
  );
}
