import { FieldError, FieldLabel, NumberField, Select, TextField } from "../ui/Field";
import { RadioGroup } from "../ui/RadioGroup";
import { ACTIVITY_LEVELS, GOALS, SEXES } from "../../types/api";
import type { ProfileErrors, ProfileForm as FormState } from "../../hooks/useProfile";

interface Props {
  form: FormState;
  errors: ProfileErrors;
  onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
}

const SEX_LABELS: Record<(typeof SEXES)[number], string> = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
};

const GOAL_LABELS: Record<(typeof GOALS)[number], string> = {
  lose_weight: "Lose weight",
  maintain_weight: "Maintain weight",
  gain_weight: "Gain weight",
};

const ACTIVITY_LABELS: Record<(typeof ACTIVITY_LEVELS)[number], string> = {
  sedentary: "Sedentary",
  lightly_active: "Lightly active",
  moderately_active: "Moderately active",
  very_active: "Very active",
  extra_active: "Extra active",
};

export function ProfileForm({ form, errors, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Name</FieldLabel>
        <TextField
          value={form.name}
          invalid={errors.name}
          aria-label="Name"
          onChange={(e) => onChange("name", e.target.value)}
        />
        {errors.name && <FieldError>A name is required.</FieldError>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <FieldLabel>Age</FieldLabel>
          <NumberField
            value={form.age}
            invalid={errors.age}
            aria-label="Age"
            onChange={(e) => onChange("age", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Height (cm)</FieldLabel>
          <NumberField
            value={form.height}
            invalid={errors.height}
            aria-label="Height"
            onChange={(e) => onChange("height", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Weight (kg)</FieldLabel>
          <NumberField
            value={form.weight}
            invalid={errors.weight}
            aria-label="Weight"
            onChange={(e) => onChange("weight", e.target.value)}
          />
        </div>
      </div>
      {(errors.age || errors.height || errors.weight) && (
        <FieldError>Age, height and weight must all be greater than zero.</FieldError>
      )}

      <div>
        <FieldLabel>Sex</FieldLabel>
        <RadioGroup
          name="sex"
          options={SEXES}
          value={form.sex}
          onChange={(v) => onChange("sex", v)}
          label={(v) => SEX_LABELS[v]}
        />
      </div>

      <div>
        <FieldLabel>Goal</FieldLabel>
        <Select
          value={form.goal}
          aria-label="Goal"
          onChange={(e) => onChange("goal", e.target.value as FormState["goal"])}
        >
          {GOALS.map((g) => (
            <option key={g} value={g}>
              {GOAL_LABELS[g]}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <FieldLabel>Activity level</FieldLabel>
        <Select
          value={form.activity_level}
          aria-label="Activity level"
          onChange={(e) =>
            onChange("activity_level", e.target.value as FormState["activity_level"])
          }
        >
          {ACTIVITY_LEVELS.map((a) => (
            <option key={a} value={a}>
              {ACTIVITY_LABELS[a]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
