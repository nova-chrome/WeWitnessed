"use client";

import { useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "~/convex/_generated/api";
import { CameraScreen } from "~/features/camera/components/camera-screen";
import { GuestNameDialog } from "~/features/guests/components/guest-name-dialog";
import { useGuestSession } from "~/features/guests/hooks/use-guest-session";
import { usePhotoUpload } from "~/features/photos/hooks/use-photo-upload";
import { tryCatch } from "~/utils/try-catch";

interface EventCameraViewProps {
  slug: string;
}

export function EventCameraView({ slug }: EventCameraViewProps) {
  const event = useQuery(api.events.getBySlug, { slug });
  const { guestId, createGuest } = useGuestSession(slug, event?._id);
  const { upload, isUploading } = usePhotoUpload();

  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);

  const uploadPhoto = useCallback(
    async (blob: Blob, resolvedGuestId: string | null) => {
      if (!event) return;

      const { error } = await tryCatch(
        upload(
          event._id,
          resolvedGuestId as Parameters<typeof upload>[1],
          blob,
        ),
      );

      if (error) {
        toast.error("Upload failed. Please try again.");
        return;
      }

      toast.success("Photo uploaded!");
    },
    [event, upload],
  );

  const handlePhotoCaptured = useCallback(
    async (blob: Blob) => {
      if (!event || isUploading) return;

      if (!guestId && !showNamePrompt) {
        setPendingBlob(blob);
        setShowNamePrompt(true);
        return;
      }

      await uploadPhoto(blob, guestId);
    },
    [event, guestId, isUploading, showNamePrompt, uploadPhoto],
  );

  const handleNameDialogClose = useCallback(() => {
    setShowNamePrompt(false);
    setPendingBlob(null);
  }, []);

  if (event === undefined) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <div className="size-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="flex h-svh flex-col items-center justify-center bg-background px-6">
        <p className="text-sm tracking-wide text-muted-foreground">
          Event not found.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-svh overflow-hidden">
      <CameraScreen
        backHref={`/e/${slug}`}
        isUploading={isUploading}
        onPhotoCaptured={handlePhotoCaptured}
      />

      <GuestNameDialog
        open={showNamePrompt}
        createGuest={createGuest}
        onComplete={async (resolvedGuestId) => {
          setShowNamePrompt(false);
          if (pendingBlob) await uploadPhoto(pendingBlob, resolvedGuestId);
          setPendingBlob(null);
        }}
        onClose={handleNameDialogClose}
      />
    </div>
  );
}
