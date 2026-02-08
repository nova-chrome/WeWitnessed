"use client";

import { useMutation } from "convex/react";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";
import { tryCatch } from "~/utils/try-catch";

interface DeletePhotoButtonProps {
  photoId: Id<"photos">;
  eventId: Id<"events">;
  coupleSecret?: string;
  deviceId?: string;
  onDeleted: () => void;
  className?: string;
}

export function DeletePhotoButton({
  photoId,
  eventId,
  coupleSecret,
  deviceId,
  onDeleted,
  className,
}: DeletePhotoButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const removePhoto = useMutation(api.photos.remove);

  async function handleDelete() {
    setIsDeleting(true);
    const { error } = await tryCatch(
      removePhoto({ photoId, eventId, coupleSecret, deviceId }),
    );
    setIsDeleting(false);

    if (error) {
      toast.error("Failed to delete photo");
      return;
    }

    toast.success("Photo deleted");
    setOpen(false);
    onDeleted();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "absolute z-10 flex items-center justify-center",
          "size-10 rounded-full bg-black/40 text-white backdrop-blur-md",
          "transition-all active:scale-90",
          className,
        )}
        aria-label="Delete photo"
      >
        <Trash2Icon className="size-5" />
      </button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete photo?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The photo will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            variant="destructive"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
