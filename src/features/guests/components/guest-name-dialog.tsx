"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
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
import { tryCatch } from "~/utils/try-catch";

interface GuestNameDialogProps {
  open: boolean;
  blob: Blob | null;
  createGuest: (name: string) => Promise<string>;
  uploadPhoto: (blob: Blob, guestId: string | null) => Promise<void>;
  onClose: () => void;
}

export function GuestNameDialog({
  open,
  blob,
  createGuest,
  uploadPhoto,
  onClose,
}: GuestNameDialogProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !blob) return;

    setIsSubmitting(true);
    const { data: guestId, error } = await tryCatch(
      createGuest(name.trim()),
    );
    setIsSubmitting(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    onClose();
    await uploadPhoto(blob, guestId);
  }, [name, blob, createGuest, uploadPhoto, onClose]);

  const handleSkip = useCallback(async () => {
    if (!blob) return;

    onClose();
    await uploadPhoto(blob, null);
  }, [blob, uploadPhoto, onClose]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>What&apos;s your name?</DialogTitle>
          <DialogDescription>
            Your name will appear with your photos. You can skip this if you
            prefer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="guest-name">Name</Label>
          <Input
            id="guest-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) {
                handleSubmit();
              }
            }}
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
