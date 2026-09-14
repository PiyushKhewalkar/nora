import { ProfileForm } from "../components/profile/ProfileForm";
import { TargetsPanel } from "../components/profile/TargetsPanel";
import { Button } from "../components/ui/Button";
import { useProfile } from "../hooks/useProfile";

export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const profile = useProfile();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="flex items-center justify-between border-b border-divider px-3 py-3">
        <Button variant="ghost" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Today
        </Button>
        <span className="font-heading text-lg">Profile</span>
        <span className="w-16" aria-hidden />
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
            <p className="font-heading text-lg">Could not load your profile</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{profile.loadError}</p>
            <Button variant="primary" className="mt-4" onClick={profile.reload}>
              Try again
            </Button>
          </div>
        )}

        {(profile.status === "ready" || profile.status === "absent") && (
          <>
            {profile.status === "absent" && !profile.createdId && (
              <p className="rounded-md border border-divider bg-accent-soft px-3 py-2 text-sm">
                No profile is configured yet. Fill this in and save to create one.
              </p>
            )}

            {/* V1 has no auth: a newly created profile only takes effect once
                its id is set as DEFAULT_USER_ID on the server. */}
            {profile.createdId && (
              <div className="rounded-md border border-divider bg-accent-soft px-3 py-3 text-sm">
                <p className="font-heading text-base">Profile created</p>
                <p className="mt-1 text-muted">
                  One more step: set <code className="text-ink">DEFAULT_USER_ID</code> on the
                  server to this id, then reload.
                </p>
                <code className="mt-2 block overflow-x-auto rounded bg-bg px-2 py-1 text-xs text-ink">
                  {profile.createdId}
                </code>
              </div>
            )}

            <p className="text-sm text-muted">
              Targets are derived by the server from these values and recalculated when you
              save. They are never entered directly.
            </p>

            <ProfileForm form={profile.form} errors={profile.errors} onChange={profile.setField} />

            <TargetsPanel user={profile.user} stale={profile.dirty && profile.user !== null} />

            {profile.saveError && (
              <p role="alert" className="text-sm text-accent-deep">
                {profile.saveError}
              </p>
            )}

            <Button
              variant="primary"
              block
              disabled={profile.saving || (!profile.dirty && profile.user !== null)}
              onClick={profile.save}
            >
              {profile.saving
                ? "Saving…"
                : profile.user
                  ? profile.dirty
                    ? "Save profile"
                    : "Saved"
                  : "Create profile"}
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
