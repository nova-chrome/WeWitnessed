"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from "~/components/ui/dialog";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";
import { DeletePhotoButton } from "./delete-photo-button";
import { VisibilityToggle } from "./visibility-toggle";

interface Photo {
  _id: Id<"photos">;
  url: string | null;
  isPublic: boolean;
  guestId?: Id<"guests">;
}

interface CoupleInfo {
  isCouple: true;
  coupleSecret: string;
  eventId: Id<"events">;
}

interface GuestInfo {
  guestId: Id<"guests">;
  deviceId: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  eventId: Id<"events">;
  couple?: CoupleInfo;
  guest?: GuestInfo;
}

function canDeletePhoto(
  photo: Photo,
  couple?: CoupleInfo,
  guest?: GuestInfo,
): boolean {
  if (couple?.isCouple) return true;
  if (guest?.guestId && photo.guestId === guest.guestId) return true;
  return false;
}

export function PhotoLightbox({
  photos,
  selectedIndex,
  onClose,
  onNavigate,
  eventId,
  couple,
  guest,
}: PhotoLightboxProps) {
  const photo = selectedIndex !== null ? photos[selectedIndex] : null;
  const hasPrev = selectedIndex !== null && selectedIndex > 0;
  const hasNext = selectedIndex !== null && selectedIndex < photos.length - 1;

  async function handleDownload() {
    if (!photo?.url) return;
    const response = await fetch(photo.url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `photo-${photo._id}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePhotoDeleted() {
    if (selectedIndex === null) return;
    if (photos.length <= 1) {
      onClose();
      return;
    }
    if (selectedIndex >= photos.length - 1) {
      onNavigate(selectedIndex - 1);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (selectedIndex === null) return;
    if (e.key === "ArrowLeft" && hasPrev) {
      e.preventDefault();
      onNavigate(selectedIndex - 1);
    }
    if (e.key === "ArrowRight" && hasNext) {
      e.preventDefault();
      onNavigate(selectedIndex + 1);
    }
  }

  return (
    <Dialog
      open={selectedIndex !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="bg-black/90!" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center outline-none"
          onKeyDown={handleKeyDown}
          aria-label="Photo viewer"
        >
          <DialogPrimitive.Title className="sr-only">
            Photo viewer
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Viewing photo {selectedIndex !== null ? selectedIndex + 1 : 0} of{" "}
            {photos.length}
          </DialogPrimitive.Description>

          {/* Close button */}
          <DialogClose
            className={cn(
              "absolute top-4 right-4 z-10 flex items-center justify-center",
              "size-10 rounded-full bg-black/40 text-white backdrop-blur-md",
              "transition-all active:scale-90",
            )}
          >
            <XIcon className="size-5" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {/* Previous arrow */}
          {hasPrev && (
            <button
              type="button"
              onClick={() => onNavigate(selectedIndex - 1)}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                "flex items-center justify-center size-10 rounded-full",
                "bg-black/40 text-white backdrop-blur-md",
                "transition-all active:scale-90",
              )}
              aria-label="Previous photo"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
          )}

          {/* Next arrow */}
          {hasNext && (
            <button
              type="button"
              onClick={() => onNavigate(selectedIndex + 1)}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                "flex items-center justify-center size-10 rounded-full",
                "bg-black/40 text-white backdrop-blur-md",
                "transition-all active:scale-90",
              )}
              aria-label="Next photo"
            >
              <ChevronRightIcon className="size-6" />
            </button>
          )}

          {/* Photo */}
          {photo?.url && (
            <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-auto px-12">
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="100vw"
                className={cn(
                  "object-contain",
                  couple?.isCouple && !photo.isPublic && "opacity-50",
                )}
                priority
              />
            </div>
          )}

          {/* Download button */}
          {photo?.url && (
            <button
              type="button"
              onClick={handleDownload}
              className={cn(
                "absolute bottom-4 right-4 z-10 flex items-center justify-center",
                "size-10 rounded-full bg-black/40 text-white backdrop-blur-md",
                "transition-all active:scale-90",
              )}
              aria-label="Download photo"
            >
              <DownloadIcon className="size-5" />
            </button>
          )}

          {/* Delete button */}
          {photo && canDeletePhoto(photo, couple, guest) && (
            <DeletePhotoButton
              photoId={photo._id}
              eventId={eventId}
              coupleSecret={couple?.coupleSecret}
              deviceId={guest?.deviceId}
              onDeleted={handlePhotoDeleted}
              className="bottom-4 left-4"
            />
          )}

          {/* Visibility toggle for couple view */}
          {couple?.isCouple && couple.coupleSecret && photo && (
            <VisibilityToggle
              photoId={photo._id}
              eventId={couple.eventId}
              coupleSecret={couple.coupleSecret}
              isPublic={photo.isPublic}
              className="top-4 left-4 right-auto"
            />
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
