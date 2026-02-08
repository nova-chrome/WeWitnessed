"use client";

import { useMutation } from "convex/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";

interface VisibilityToggleProps {
  photoId: Id<"photos">;
  eventId: Id<"events">;
  coupleSecret: string;
  isPublic: boolean;
  className?: string;
}

export function VisibilityToggle({
  photoId,
  eventId,
  coupleSecret,
  isPublic,
  className,
}: VisibilityToggleProps) {
  const toggleVisibility = useMutation(api.photos.toggleVisibility);

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    await toggleVisibility({ photoId, eventId, coupleSecret });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "absolute top-2 right-2 z-10 flex items-center justify-center",
        "size-8 rounded-full backdrop-blur-md transition-all active:scale-90",
        isPublic
          ? "bg-white/20 text-white"
          : "bg-black/60 text-muted-foreground",
        className,
      )}
      aria-label={isPublic ? "Make private" : "Make public"}
    >
      {isPublic ? (
        <EyeIcon className="size-4" />
      ) : (
        <EyeOffIcon className="size-4" />
      )}
    </button>
  );
}
