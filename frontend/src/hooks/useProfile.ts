import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError } from "../api/client";
import { getCurrentUser, updateUser } from "../api/users";
import type { ActivityLevel, Goal, Sex, User } from "../types/api";

/** "incomplete" = signed in, but onboarding has not been finished. */
export type ProfileStatus = "loading" | "ready" | "incomplete" | "error";

/** Numeric fields are strings for the same reason as the meal draft: a
 *  number input cannot represent "being cleared" without becoming NaN. */
export interface ProfileForm {
  name: string;
  age: string;
  height: string;
  weight: string;
  sex: Sex;
  goal: Goal;
  activity_level: ActivityLevel;
}

export interface ProfileErrors {
  name?: boolean;
  age?: boolean;
  height?: boolean;
  weight?: boolean;
}

const BLANK: ProfileForm = {
  name: "",
  age: "",
  height: "",
  weight: "",
  sex: "prefer_not_to_say",
  goal: "maintain_weight",
  activity_level: "moderately_active",
};

function toForm(user: User): ProfileForm {
  // Every field can be null before onboarding; fall back to the blank defaults.
  return {
    name: user.name ?? "",
    age: user.age === null ? "" : String(user.age),
    height: user.height === null ? "" : String(user.height),
    weight: user.weight === null ? "" : String(user.weight),
    sex: user.sex ?? BLANK.sex,
    goal: user.goal ?? BLANK.goal,
    activity_level: user.activity_level ?? BLANK.activity_level,
  };
}

function num(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useProfile() {
  const [status, setStatus] = useState<ProfileStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>(BLANK);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setLoadError(null);
    try {
      const current = await getCurrentUser();
      setUser(current);
      setForm(toForm(current));
      // The account always exists once authenticated; what may be missing is
      // the profile, and with it the targets.
      setStatus(current.daily_calorie_target === null ? "incomplete" : "ready");
    } catch (caught) {
      const error = caught instanceof ApiError ? caught : null;
      setLoadError(error?.message ?? "Could not load your profile.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = useCallback(<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaveError(null);
  }, []);

  const errors = useMemo<ProfileErrors>(() => {
    const result: ProfileErrors = {};
    if (form.name.trim() === "") result.name = true;
    if (!(num(form.age) > 0)) result.age = true;
    if (!(num(form.height) > 0)) result.height = true;
    if (!(num(form.weight) > 0)) result.weight = true;
    return result;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  /**
   * True when the form no longer matches the saved profile.
   *
   * Targets are computed by the server, so while this is true the displayed
   * targets belong to the old values. We deliberately do not recompute them in
   * the browser: that would be a second implementation of the BMR formula,
   * free to drift from the one that actually decides your numbers.
   */
  const dirty = useMemo(() => {
    if (!user) return true;
    const saved = toForm(user);
    return (Object.keys(saved) as (keyof ProfileForm)[]).some(
      (key) => String(saved[key]) !== String(form[key]),
    );
  }, [user, form]);

  const save = useCallback(async () => {
    setShowErrors(true);
    if (!isValid) return;

    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: form.name.trim(),
        age: Math.round(num(form.age)),
        height: num(form.height),
        weight: num(form.weight),
        sex: form.sex,
        goal: form.goal,
        activity_level: form.activity_level,
      };

      await updateUser(payload);
      await load();
    } catch (caught) {
      setSaveError(
        caught instanceof ApiError ? caught.message : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }, [form, isValid, user, load]);

  return {
    status,
    user,
    form,
    setField,
    errors: showErrors ? errors : {},
    isValid,
    dirty,
    saving,
    saveError,
    loadError,
    save,
    reload: load,
  };
}
