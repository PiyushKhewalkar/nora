import { Button } from "../ui/Button";

interface Props {
  title: string;
  saveLabel: string;
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export function EditorHeader({ title, saveLabel, saving, onDiscard, onSave }: Props) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-divider bg-bg/95 px-3 py-3 backdrop-blur">
      <Button variant="ghost" onClick={onDiscard} disabled={saving}>
        Discard
      </Button>
      <span className="font-heading text-lg">{title}</span>
      <Button variant="primary" onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : saveLabel}
      </Button>
    </header>
  );
}
