import { useState } from "react";

import { CaptureScreen } from "./screens/CaptureScreen";
import { EditorScreen } from "./screens/EditorScreen";
import { TodayScreen } from "./screens/TodayScreen";
import type { DraftInit } from "./hooks/useMealDraft";
import type { Meal } from "./types/api";

type Screen = "today" | "capture" | "editor";

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
  const [screen, setScreen] = useState<Screen>("today");
  const [editor, setEditor] = useState<EditorState | null>(null);
  // Bumped after any write so Today refetches instead of showing stale numbers.
  const [dayKey, setDayKey] = useState(0);

  const openEditor = (initial: DraftInit, analysisNote: string | null = null) => {
    setEditor({ initial, analysisNote });
    setScreen("editor");
  };

  const backToToday = (refresh: boolean) => {
    setEditor(null);
    if (refresh) setDayKey((n) => n + 1);
    setScreen("today");
  };

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
      onProfile={() => console.log("profile")}
    />
  );
}
