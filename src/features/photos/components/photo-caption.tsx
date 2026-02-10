"use client";

import { useMutation } from "convex/react";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";
import { tryCatch } from "~/utils/try-catch";

const MAX_CAPTION_LENGTH = 200;

interface PhotoCaptionProps {
  photoId: Id<"photos">;
  eventId: Id<"events">;
  caption?: string;
  isOwner: boolean;
  deviceId?: string;
}

export function PhotoCaption({
  photoId,
  eventId,
  caption,
  isOwner,
  deviceId,
}: PhotoCaptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(caption ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const updateCaption = useMutation(api.photos.updateCaption);

  async function handleSave() {
    if (!deviceId) return;
    setIsSaving(true);
    const trimmed = draft.trim();
    const { error } = await tryCatch(
      updateCaption({
        photoId,
        eventId,
        deviceId,
        caption: trimmed || undefined,
      }),
    );
    setIsSaving(false);

    if (error) {
      toast.error("Failed to save caption");
      return;
    }

    toast.success(trimmed ? "Caption saved" : "Caption removed");
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(caption ?? "");
    setIsEditing(false);
  }

  // Non-owner: only show caption if it exists
  if (!isOwner) {
    if (!caption) return null;
    return (
      <p className="mx-auto mt-3 max-w-lg px-12 text-center text-sm text-white/70">
        {caption}
      </p>
    );
  }

  // Owner: edit mode
  if (isEditing) {
    return (
      <div className="mx-auto mt-3 w-full max-w-lg px-12">
        <Textarea
          value={draft}
          onChange={(e) =>
            setDraft(e.target.value.slice(0, MAX_CAPTION_LENGTH))
          }
          placeholder="Write a caption..."
          maxLength={MAX_CAPTION_LENGTH}
          rows={2}
          autoFocus
          className="min-h-0 resize-none border-white/20 bg-black/40 text-base text-white backdrop-blur-md placeholder:text-white/40"
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-white/40">
            {draft.length}/{MAX_CAPTION_LENGTH}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-7 text-xs text-white/60 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-7 bg-white/20 text-xs text-white backdrop-blur-md hover:bg-white/30"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Owner: has caption — click to edit
  if (caption) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(caption);
          setIsEditing(true);
        }}
        className={cn(
          "mx-auto mt-3 block max-w-lg px-12 text-center text-sm text-white/70",
          "transition-colors hover:text-white/90",
        )}
      >
        {caption}
      </button>
    );
  }

  // Owner: no caption — show prompt
  return (
    <button
      type="button"
      onClick={() => {
        setDraft("");
        setIsEditing(true);
      }}
      className="mx-auto mt-3 flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/60"
    >
      <PencilIcon className="size-3.5" />
      Add a caption...
    </button>
  );
}
