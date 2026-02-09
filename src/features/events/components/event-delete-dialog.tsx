"use client";

import { useMutation } from "convex/react";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { tryCatch } from "~/utils/try-catch";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";

const HOLD_DURATION_MS = 5000;

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
  const [phase, setPhase] = useState<
    "idle" | "confirming" | "holding" | "deleting"
  >("idle");
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStartRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const cancelHold = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setHoldProgress(0);
    setPhase("confirming");
  }, []);

  const handleDelete = useCallback(async () => {
    setPhase("deleting");

    const { error } = await tryCatch(deleteEvent({ eventId, coupleSecret }));

    if (error) {
      toast.error("Failed to delete event");
      setPhase("confirming");
      setHoldProgress(0);
      return;
    }

    toast.success("Event deleted");
    router.push("/");
  }, [deleteEvent, eventId, coupleSecret, router]);

  const startHold = useCallback(() => {
    setPhase("holding");
    holdStartRef.current = Date.now();

    function tick() {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        handleDelete();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [handleDelete]);

  if (phase === "idle") {
    return (
      <Button
        variant="destructive"
        className="w-full h-12 font-medium text-sm tracking-wider uppercase"
        onClick={() => setPhase("confirming")}
      >
        <Trash2Icon className="size-4" />
        Delete Event
      </Button>
    );
  }

  if (phase === "deleting") {
    return (
      <Button
        variant="destructive"
        disabled
        className="w-full h-12 font-medium text-sm tracking-wider uppercase"
      >
        <Loader2Icon className="size-4 animate-spin" />
        Deleting...
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        className={cn(
          "relative w-full h-12 rounded-md font-medium text-sm tracking-wider uppercase overflow-hidden",
          "bg-destructive/20 text-destructive border border-destructive/30",
          "transition-colors select-none touch-none",
          phase === "holding" && "text-white",
        )}
      >
        <div
          className="absolute inset-0 bg-destructive origin-left transition-none"
          style={{ transform: `scaleX(${holdProgress})` }}
        />
        <span className="relative flex items-center justify-center gap-2">
          <Trash2Icon className="size-4" />
          {phase === "holding" ? "Keep holding..." : "Hold to Delete"}
        </span>
      </button>
      <p className="text-destructive text-xs text-center">
        This will permanently delete the event, all photos, and guest data. This
        cannot be undone.
      </p>
      <button
        type="button"
        onClick={() => {
          setPhase("idle");
          setHoldProgress(0);
        }}
        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
