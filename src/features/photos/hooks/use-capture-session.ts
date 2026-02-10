"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Id } from "~/convex/_generated/dataModel";
import { tryCatch } from "~/utils/try-catch";
import { usePhotoUpload } from "./use-photo-upload";

type CaptureStatus = "uploading" | "success" | "error";

interface CaptureEntry {
  id: string;
  thumbnailUrl: string;
  status: CaptureStatus;
}

interface CaptureSession {
  addCapture: (blob: Blob) => void;
  sessionCount: number;
  lastThumbnailUrl: string | null;
  activeUploads: number;
  hasActiveUploads: boolean;
}

export function useCaptureSession(
  eventId: Id<"events"> | undefined,
  guestId: Id<"guests"> | null,
): CaptureSession {
  const { upload } = usePhotoUpload();
  const [captures, setCaptures] = useState<CaptureEntry[]>([]);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      for (const url of blobUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const addCapture = useCallback(
    (blob: Blob) => {
      if (!eventId) return;

      const id = crypto.randomUUID();
      const thumbnailUrl = URL.createObjectURL(blob);
      blobUrlsRef.current.push(thumbnailUrl);

      setCaptures((prev) => [
        ...prev,
        { id, thumbnailUrl, status: "uploading" },
      ]);

      tryCatch(upload(eventId, guestId, blob)).then(({ error }) => {
        setCaptures((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, status: error ? "error" : "success" }
              : c,
          ),
        );
      });
    },
    [eventId, guestId, upload],
  );

  const sessionCount = captures.length;
  const lastThumbnailUrl =
    captures.length > 0
      ? captures[captures.length - 1].thumbnailUrl
      : null;
  const activeUploads = captures.filter(
    (c) => c.status === "uploading",
  ).length;

  return {
    addCapture,
    sessionCount,
    lastThumbnailUrl,
    activeUploads,
    hasActiveUploads: activeUploads > 0,
  };
}
