import { ProfileForm } from "../components/profile/ProfileForm";
import { Button } from "../components/ui/Button";
import { useProfile } from "../hooks/useProfile";
import { grams, kcal } from "../lib/format";

interface Props {
  /** Called once targets exist and the user is ready to enter the app. */
  onDone: () => void;
  onLogout: () => void;
}

/**
 * First run for a signed-up account with no profile.
 *
 * Reuses the same form as the Profile screen so there is one definition of
 * what a profile is, but frames it as setup and ends by showing the targets it
 * produced - otherwise the numbers just appear later with no explanation.
 */
export function OnboardingScreen({ onDone, onLogout }: Props) {
  const profile = useProfile();

  // useProfile reports "ready" only once the server has derived targets, so
  // this flips exactly when onboarding has actually succeeded.
  const saved = profile.status === "ready" && profile.user !== null;

  if (saved) {
    const user = profile.user!;
    const cells = [
      { label: "kcal", value: kcal(user.daily_calorie_target!) },
      { label: "Prot", value: grams(user.daily_protein_target!) },
      { label: "Carb", value: grams(user.daily_carbs_target!) },
      { label: "Fat", value: grams(user.daily_fat_target!) },
    ];

    return (
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
        <h1 className="font-heading text-3xl">You're set up</h1>
        <p className="mt-2 text-sm text-muted">
          Nora worked these out from your details. They update whenever you change your
          profile.
        </p>

        <section className="mt-6 rounded-md border border-divider bg-surface/60 p-4">
          <p className="text-xs tracking-wide text-muted uppercase">Daily targets</p>
          <div className="mt-2 grid grid-cols-4 gap-2 text-center">
            {cells.map((cell) => (
              <div key={cell.label}>
                <div className="font-heading text-xl tabular-nums">{cell.value}</div>
                <div className="text-xs text-muted">{cell.label}</div>
              </div>
            ))}
          </div>
        </section>

        <Button variant="primary" block className="mt-8" onClick={onDone}>
          Start logging
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="border-b border-divider px-5 py-5">
        <h1 className="font-heading text-2xl">Welcome to Nora</h1>
        <p className="mt-1 text-sm text-muted">
          A few details, so Nora can work out what you should be eating each day.
        </p>
      </header>

      <main className="flex-1 space-y-5 px-5 py-5">
        {profile.status === "loading" && (
          <div className="space-y-3 py-6" aria-busy="true">
            {[80, 50, 70, 60].map((w, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-surface" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {profile.status === "error" && (
          <div className="py-10 text-center">
            <p className="font-heading text-lg">Could not load your account</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{profile.loadError}</p>
            <Button variant="primary" className="mt-4" onClick={profile.reload}>
              Try again
            </Button>
          </div>
        )}

        {profile.status === "incomplete" && (
          <>
            <ProfileForm form={profile.form} errors={profile.errors} onChange={profile.setField} />

            <p className="text-xs text-muted">
              Targets are calculated from these, not entered directly. You can change them
              any time.
            </p>

            {profile.saveError && (
              <p role="alert" className="text-sm text-accent-deep">
                {profile.saveError}
              </p>
            )}

            <Button variant="primary" block disabled={profile.saving} onClick={profile.save}>
              {profile.saving ? "Saving…" : "Continue"}
            </Button>

            {/* Never trap someone on this screen - wrong account, wrong device. */}
            <Button variant="ghost" block onClick={onLogout}>
              Sign out
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
