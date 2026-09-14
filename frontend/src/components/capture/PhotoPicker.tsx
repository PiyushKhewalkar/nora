import { FileButton } from "../ui/FileButton";

export function PhotoPicker({ onFile }: { onFile: (file: File) => void }) {
  return (
    <div className="px-5 py-8 text-center">
      <h2 className="font-heading text-2xl">Photograph the meal</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
        Shoot from above, the whole plate in frame. Analysis takes ten to twenty seconds.
      </p>

      <div className="my-8 flex justify-center text-divider">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M14.5 4h-5L8 6H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-4z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      </div>

      <div className="space-y-2">
        <FileButton onFile={onFile} useCamera variant="primary">
          Take a photo
        </FileButton>
        <FileButton onFile={onFile}>Choose an existing photo</FileButton>
      </div>

      <p className="mt-4 text-xs text-muted">JPEG, PNG, WebP or HEIC · 10 MB maximum</p>
    </div>
  );
}
