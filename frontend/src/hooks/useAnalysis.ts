import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "../api/client";
import { analyseMealImage, uploadMealImage } from "../api/meals";
import type { AnalysisResult } from "../types/api";

export type CapturePhase = "choosing" | "uploading" | "analysing" | "problem";

export interface Problem {
  kicker: string;
  title: string;
  body: string;
  /** True when re-running the same request could plausibly work. */
  retryable: boolean;
}

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MAX_BYTES = 10 * 1024 * 1024;

/** Mirrors the server's own limits so obvious rejects cost no round trip. */
function preValidate(file: File): Problem | null {
  // Some browsers report an empty type for HEIC; fall back to the extension.
  const looksHeic = /\.hei[cf]$/i.test(file.name);
  if (file.type && !ACCEPTED_TYPES.has(file.type) && !looksHeic) {
    return {
      kicker: "Unsupported file",
      title: "That is not a photo we can read",
      body: "Choose a JPEG, PNG, WebP or HEIC image.",
      retryable: false,
    };
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      kicker: "Too large",
      title: `That photo is ${mb} MB`,
      body: "The limit is 10 MB. Try a smaller image.",
      retryable: false,
    };
  }
  return null;
}

function describe(error: ApiError): Problem {
  if (error.status === 415) {
    return {
      kicker: "Unsupported file",
      title: "That is not a photo we can read",
      body: "Choose a JPEG, PNG, WebP or HEIC image.",
      retryable: false,
    };
  }
  if (error.status === 413) {
    return {
      kicker: "Too large",
      title: "That photo is over 10 MB",
      body: "Try a smaller image.",
      retryable: false,
    };
  }
  if (error.kind === "timeout") {
    return {
      kicker: "Timed out",
      title: "The estimate took too long",
      body: "The photo is stored, so retrying will not upload it again.",
      retryable: true,
    };
  }
  if (error.kind === "network") {
    return {
      kicker: "Offline",
      title: "Could not reach the server",
      body: "Check your connection and try again.",
      retryable: true,
    };
  }
  if (error.kind === "server") {
    return {
      kicker: "Server error",
      title: "Something went wrong",
      body: error.message,
      retryable: true,
    };
  }
  return {
    kicker: "Rejected",
    title: "The request was refused",
    body: error.message,
    retryable: false,
  };
}

export interface UseAnalysisResult {
  phase: CapturePhase;
  /** 0-100 during upload. Real, from the bytes on the wire. */
  uploadPercent: number;
  /** Milliseconds since the current attempt started. */
  elapsedMs: number;
  /** Local object URL, shown the instant a file is chosen. */
  previewUrl: string | null;
  /** Set once the upload succeeds; survives an analysis failure. */
  imageUrl: string | null;
  problem: Problem | null;
  start: (file: File) => void;
  retry: () => void;
  cancel: () => void;
}

/**
 * Drives the two-phase capture flow.
 *
 * Phase one uploads and reports real byte progress. Phase two asks for the
 * estimate and can only be indeterminate — the server does not stream progress.
 *
 * `imageUrl` is kept deliberately: if analysis fails after a successful upload,
 * retrying re-runs only the analysis, and "enter by hand" can still carry the
 * photo into the editor. That is the whole reason the endpoints are split.
 *
 * An empty `foods` array is a success. The caller decides what to do about it.
 */
export function useAnalysis(onComplete: (result: AnalysisResult) => void): UseAnalysisResult {
  const [phase, setPhase] = useState<CapturePhase>("choosing");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);

  const controller = useRef<AbortController | null>(null);
  const startedAt = useRef<number>(0);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  // Object URLs leak until revoked; tie them to the preview's lifetime.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const running = phase === "uploading" || phase === "analysing";

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsedMs(Date.now() - startedAt.current), 200);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => () => controller.current?.abort(), []);

  const runAnalysis = useCallback(async (url: string, signal: AbortSignal) => {
    setPhase("analysing");
    const result = await analyseMealImage(url, { signal });
    completeRef.current(result);
  }, []);

  const fail = useCallback((caught: unknown) => {
    const error = caught instanceof ApiError ? caught : new ApiError("server", "Unexpected failure.", null);
    if (error.kind === "canceled") return; // our own abort, not a failure
    setProblem(describe(error));
    setPhase("problem");
  }, []);

  const start = useCallback(
    (file: File) => {
      const rejected = preValidate(file);
      if (rejected) {
        setProblem(rejected);
        setPhase("problem");
        return;
      }

      controller.current?.abort();
      const ac = new AbortController();
      controller.current = ac;

      setPreviewUrl(URL.createObjectURL(file));
      setImageUrl(null);
      setProblem(null);
      setUploadPercent(0);
      setElapsedMs(0);
      startedAt.current = Date.now();
      setPhase("uploading");

      void (async () => {
        try {
          const uploaded = await uploadMealImage(file, {
            signal: ac.signal,
            onProgress: setUploadPercent,
          });
          if (ac.signal.aborted) return;
          setImageUrl(uploaded.image_url);
          await runAnalysis(uploaded.image_url, ac.signal);
        } catch (caught) {
          if (ac.signal.aborted) return;
          fail(caught);
        }
      })();
    },
    [fail, runAnalysis],
  );

  const retry = useCallback(() => {
    // Only reachable when the upload already succeeded, so skip straight to
    // analysis rather than making the user re-send the photo.
    if (!imageUrl) return;

    controller.current?.abort();
    const ac = new AbortController();
    controller.current = ac;

    setProblem(null);
    setElapsedMs(0);
    startedAt.current = Date.now();

    void (async () => {
      try {
        await runAnalysis(imageUrl, ac.signal);
      } catch (caught) {
        if (ac.signal.aborted) return;
        fail(caught);
      }
    })();
  }, [imageUrl, fail, runAnalysis]);

  const cancel = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setPhase("choosing");
    setProblem(null);
    setUploadPercent(0);
    setElapsedMs(0);
  }, []);

  return {
    phase,
    uploadPercent,
    elapsedMs,
    previewUrl,
    imageUrl,
    problem,
    start,
    retry,
    cancel,
  };
}
