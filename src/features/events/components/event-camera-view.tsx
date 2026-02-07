"use client";

import { useCallback, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { tryCatch } from "~/utils/try-catch";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CameraScreen } from "~/features/camera/components/camera-screen";
import { useGuestSession } from "~/features/guests/hooks/use-guest-session";
import { usePhotoUpload } from "~/features/photos/hooks/use-photo-upload";

interface EventCameraViewProps {
  slug: string;
}

export function EventCameraView({ slug }: EventCameraViewProps) {
  const event = useQuery(api.events.getBySlug, { slug });
  const { guestId, isReady, createGuest } = useGuestSession(
    slug,
    event?._id,
  );
  const { upload, isUploading } = usePhotoUpload();

  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);
  const pendingBlobRef = useRef<Blob | null>(null);

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
        pendingBlobRef.current = blob;
        setShowNamePrompt(true);
        return;
      }

      await uploadPhoto(blob, guestId);
    },
    [event, guestId, isUploading, showNamePrompt, uploadPhoto],
  );

  const handleNameSubmit = useCallback(async () => {
    const blob = pendingBlobRef.current;
    if (!blob) return;

    setIsCreatingGuest(true);
    const { data: newGuestId, error } = await tryCatch(
      createGuest(nameInput.trim()),
    );
    setIsCreatingGuest(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setShowNamePrompt(false);
    pendingBlobRef.current = null;
    await uploadPhoto(blob, newGuestId);
  }, [nameInput, createGuest, uploadPhoto]);

  const handleSkipName = useCallback(async () => {
    const blob = pendingBlobRef.current;
    if (!blob) return;

    setShowNamePrompt(false);
    pendingBlobRef.current = null;
    await uploadPhoto(blob, null);
  }, [uploadPhoto]);

  if (event === undefined) {
    return (
      <div className="flex h-svh items-center justify-center bg-[#0a0a0a]">
        <div className="size-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="flex h-svh flex-col items-center justify-center bg-[#0a0a0a] px-6">
        <p className="text-sm tracking-wide text-neutral-400">
          Event not found.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <CameraScreen onPhotoCaptured={handlePhotoCaptured} />

      {/* Back button overlay */}
      <Link
        href={`/e/${slug}`}
        className="absolute left-4 top-safe-or-4 z-20 flex items-center justify-center rounded-full bg-black/50 p-2 backdrop-blur-md transition-all hover:bg-black/60 active:scale-95"
        aria-label="Back to gallery"
      >
        <ArrowLeftIcon className="size-5 text-white" />
      </Link>

      {/* Upload indicator */}
      {isUploading && (
        <div className="absolute right-4 top-safe-or-4 z-20 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-md">
          <div className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="text-xs text-white/80">Uploading...</span>
        </div>
      )}

      {/* Guest name prompt dialog */}
      <Dialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
        <DialogContent
          showCloseButton={false}
          className="border-neutral-800 bg-neutral-900 text-white"
        >
          <DialogHeader>
            <DialogTitle className="text-neutral-100">
              What's your name?
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Your name will appear with your photos. You can skip this if you
              prefer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="guest-name" className="text-neutral-300">
              Name
            </Label>
            <Input
              id="guest-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Sarah"
              className="border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && nameInput.trim()) {
                  handleNameSubmit();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={handleSkipName}
              disabled={isCreatingGuest}
              className="text-neutral-400 hover:text-neutral-200"
            >
              Skip
            </Button>
            <Button
              onClick={handleNameSubmit}
              disabled={!nameInput.trim() || isCreatingGuest}
            >
              {isCreatingGuest ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
