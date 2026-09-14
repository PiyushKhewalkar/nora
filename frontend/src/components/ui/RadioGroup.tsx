interface Props<T extends string> {
  name: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: (value: T) => string;
}

export function RadioGroup<T extends string>({ name, options, value, onChange, label }: Props<T>) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map((option) => {
        const selected = value === option;
        return (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name={name}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={`grid h-4 w-4 place-items-center rounded-full border ${
                selected ? "border-accent" : "border-divider"
              }`}
            >
              {selected && <span className="h-2 w-2 rounded-full bg-accent" />}
            </span>
            {label(option)}
          </label>
        );
      })}
    </div>
  );
}
