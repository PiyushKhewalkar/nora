interface Props<T extends string> {
  name: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  label: (value: T) => string;
}

/**
 * Radio group styled as a segmented control. Real radios, so it is keyboard
 * navigable and announced as a group without extra ARIA.
 */
export function SegmentedControl<T extends string>({
  name,
  options,
  value,
  onChange,
  label,
}: Props<T>) {
  return (
    <div className="flex overflow-hidden rounded-md border border-divider">
      {options.map((option, index) => {
        const selected = value === option;
        return (
          <label
            key={option}
            className={`flex-1 cursor-pointer py-2 text-center text-sm transition-colors ${
              index > 0 ? "border-l border-divider" : ""
            } ${selected ? "bg-accent-soft font-medium text-accent-deep" : "text-ink hover:bg-surface"}`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {label(option)}
          </label>
        );
      })}
    </div>
  );
}
