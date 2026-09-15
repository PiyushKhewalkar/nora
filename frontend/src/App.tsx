import { useState } from "react";

import { AuthScreen } from "./screens/AuthScreen";
import { Button } from "./components/ui/Button";
import { CaptureScreen } from "./screens/CaptureScreen";
import { EditorScreen } from "./screens/EditorScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { TodayScreen } from "./screens/TodayScreen";
import type { DraftInit } from "./hooks/useMealDraft";
import { useAuth } from "./hooks/useAuth";
import { useProfileGate } from "./hooks/useProfileGate";
import type { Meal } from "./types/api";

type Screen = "today" | "capture" | "editor" | "profile";

interface EditorState {
  initial: DraftInit;
  analysisNote: string | null;
}

/**
 * Screen switching by state rather than a router. Deliberate for now: there is
 * nothing to deep link to yet, and swapping in a router later touches only
 * this file.
 */
export default function App() {
  const auth = useAuth();
  const gate = useProfileGate(auth.authenticated);
  const [screen, setScreen] = useState<Screen>("today");
  const [editor, setEditor] = useState<EditorState | null>(null);
  // Bumped after any write so Today refetches instead of showing stale numbers.
  const [dayKey, setDayKey] = useState(0);

  const openEditor = (initial: DraftInit, analysisNote: string | null = null) => {
    setEditor({ initial, analysisNote });
    setScreen("editor");
  };

  const signOut = () => {
    auth.logout();
    setScreen("today");
  };

  const backToToday = (refresh: boolean) => {
    setEditor(null);
    if (refresh) setDayKey((n) => n + 1);
    setScreen("today");
  };

  // Everything below this line assumes a signed-in user: every data route
  // requires a token, so there is nothing meaningful to render without one.
  if (!auth.authenticated) {
    return (
      <AuthScreen
        busy={auth.busy}
        error={auth.error}
        onSubmit={auth.submit}
        onModeChange={auth.clearError}
      />
    );
  }

  // An account without targets has nothing to show on Today, so onboarding
  // comes first rather than being something to go and find.
  if (gate.status === "loading") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-sm items-center justify-center px-6">
        <p className="text-sm text-muted">Loading your account…</p>
      </div>
    );
  }

  if (gate.status === "error") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6 text-center">
        <p className="font-heading text-lg">Could not load your account</p>
        <p className="mt-1 text-sm text-muted">{gate.error}</p>
        <Button variant="primary" className="mt-4" onClick={gate.retry}>
          Try again
        </Button>
      </div>
    );
  }

  if (gate.status === "needed") {
    return <OnboardingScreen onDone={gate.markComplete} onLogout={signOut} />;
  }

  if (screen === "capture") {
    return (
      <CaptureScreen
        onAnalysed={(result) =>
          openEditor(
            { foods: result.foods, mealType: null, imageUrl: result.image_url },
            result.foods.length === 0
              ? "The estimate found nothing in this photo. Add the items by hand."
              : "Estimated from your photo. Check the quantities before saving.",
          )
        }
        onManual={(imageUrl) => openEditor({ foods: [], mealType: null, imageUrl })}
        onCancel={() => setScreen("today")}
      />
    );
  }

  if (screen === "profile") {
    // Refresh Today on the way back: saving a profile changes the targets it shows.
    return (
      <ProfileScreen
        onBack={() => backToToday(true)}
        onLogout={signOut}
      />
    );
  }

  if (screen === "editor" && editor) {
    return (
      <EditorScreen
        // Remount on a different draft so the hook re-seeds from `initial`.
        key={editor.initial.id ?? "new"}
        initial={editor.initial}
        analysisNote={editor.analysisNote}
        onSaved={() => backToToday(true)}
        onDeleted={() => backToToday(true)}
        onDiscard={() => backToToday(false)}
      />
    );
  }

  return (
    <TodayScreen
      key={dayKey}
      onCapture={() => setScreen("capture")}
      onManual={() => openEditor({ foods: [], mealType: null, imageUrl: null })}
      onOpenMeal={(meal: Meal) =>
        openEditor({
          id: meal.id,
          foods: meal.foods,
          mealType: meal.meal_type,
          imageUrl: meal.image_url,
        })
      }
      onProfile={() => setScreen("profile")}
    />
  );
}
