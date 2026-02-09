"use client";

import { useMutation } from "convex/react";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { tryCatch } from "~/utils/try-catch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface EventDeleteDialogProps {
  eventId: Id<"events">;
  coupleSecret: string;
}

export function EventDeleteDialog({
  eventId,
  coupleSecret,
}: EventDeleteDialogProps) {
  const router = useRouter();
  const deleteEvent = useMutation(api.events.remove);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full h-12 font-medium text-sm tracking-wider uppercase"
        >
          <Trash2Icon className="size-4" />
          Delete Event
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Event?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the event, all photos, and guest data.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={async (e) => {
              e.preventDefault();
              setIsDeleting(true);

              const { error } = await tryCatch(
                deleteEvent({ eventId, coupleSecret }),
              );

              if (error) {
                toast.error("Failed to delete event");
                setIsDeleting(false);
                return;
              }

              toast.success("Event deleted");
              router.push("/");
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
