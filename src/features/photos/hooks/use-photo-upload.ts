"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface PhotoUpload {
  upload: (
    eventId: Id<"events">,
    guestId: Id<"guests"> | null,
    blob: Blob,
  ) => Promise<Id<"photos">>;
  isUploading: boolean;
}

export function usePhotoUpload(): PhotoUpload {
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const createPhoto = useMutation(api.photos.create);

  const upload = useCallback(
    async (
      eventId: Id<"events">,
      guestId: Id<"guests"> | null,
      blob: Blob,
    ): Promise<Id<"photos">> => {
      setIsUploading(true);
      try {
        const uploadUrl = await generateUploadUrl();

        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type },
          body: blob,
        });

        if (!response.ok) {
          throw new Error("Failed to upload photo");
        }

        const { storageId } = (await response.json()) as {
          storageId: Id<"_storage">;
        };

        const photoId = await createPhoto({
          eventId,
          guestId: guestId ?? undefined,
          storageId,
        });

        return photoId;
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl, createPhoto],
  );

  return { upload, isUploading };
}
