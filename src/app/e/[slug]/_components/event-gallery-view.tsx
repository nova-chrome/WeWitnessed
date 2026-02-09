"use client";

import { useQuery } from "convex/react";
import {
  CameraIcon,
  HeartIcon,
  KeyRoundIcon,
  PencilIcon,
  Share2Icon,
} from "lucide-react";
import Image from "next/image";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "~/components/theme-toggle";
import { api } from "~/convex/_generated/api";
import { EventEditDrawer } from "~/features/events/components/event-edit-drawer";
import { EventShareDialog } from "~/features/events/components/event-share-dialog";
import { useCoupleSession } from "~/features/events/hooks/use-couple-session";
import { useGuestSession } from "~/features/guests/hooks/use-guest-session";
import { cn } from "~/lib/utils";
import { PhotoLightbox } from "./photo-lightbox";
import type { ViewMode } from "./view-toggle";
import { ViewToggle } from "./view-toggle";
import { VisibilityToggle } from "./visibility-toggle";

interface EventGalleryViewProps {
  slug: string;
}

export function EventGalleryView({ slug }: EventGalleryViewProps) {
  const event = useQuery(api.events.getBySlug, { slug });
  const couple = useCoupleSession(slug, event?._id);
  const guest = useGuestSession(slug, event?._id);

  const photos = useQuery(
    api.photos.getByEvent,
    event
      ? {
          eventId: event._id,
          ...(couple.coupleSecret ? { coupleSecret: couple.coupleSecret } : {}),
        }
      : "skip",
  );

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);

  function handlePhotoClick(index: number) {
    setSelectedPhotoIndex(index);
  }

  function handleLightboxClose() {
    setSelectedPhotoIndex(null);
  }

  function toggleViewMode() {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  }

  if (event === undefined) {
    return (
      <div className="relative min-h-svh bg-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-muted via-background to-background pointer-events-none" />

        {/* Header skeleton */}
        <div className="relative pt-safe-or-4 px-4 pb-4">
          <div className="flex flex-col items-center gap-1 pt-4">
            <div className="text-3xl font-light text-foreground tracking-tight">
              W
            </div>
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        </div>

        {/* Gallery skeleton */}
        <div className="relative px-2 pb-24">
          <div className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-none" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="relative min-h-svh bg-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-muted via-background to-background pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center min-h-svh px-6">
          <div className="text-5xl font-light text-foreground tracking-tight mb-8">
            W
          </div>
          <p className="text-muted-foreground text-center text-sm tracking-wide">
            Event not found. Check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  const hasPhotos = photos && photos.length > 0;

  return (
    <div className="relative min-h-svh bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-muted via-background to-background pointer-events-none" />

      {/* Header */}
      <div className="relative pt-safe-or-4 px-4 pb-4">
        {/* Couple share button */}
        {couple.isCouple && couple.coupleSecret && (
          <div className="absolute top-4 left-4 z-10">
            <EventShareDialog slug={slug} coupleSecret={couple.coupleSecret} />
          </div>
        )}

        {/* View toggle + Theme toggle */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
          {hasPhotos && (
            <ViewToggle viewMode={viewMode} onToggle={toggleViewMode} />
          )}
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center gap-1 pt-4">
          <div className="text-3xl font-light text-foreground tracking-tight">
            W
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-light text-foreground tracking-tight">
              {event.name}
            </h1>
            {couple.isCouple && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center justify-center size-6 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Edit event"
              >
                <PencilIcon className="size-3.5" />
              </button>
            )}
          </div>
          {couple.isCouple && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-400 tracking-wide">
              <KeyRoundIcon className="size-3" />
              Couple View
            </span>
          )}
          {hasPhotos && (
            <p className="text-muted-foreground text-xs tracking-wide">
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </p>
          )}
        </div>
      </div>

      {/* Gallery content */}
      <div className="relative px-2 pb-24">
        {photos === undefined ? (
          <div className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-none" />
            ))}
          </div>
        ) : !hasPhotos ? (
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="flex items-center justify-center size-16 rounded-full bg-muted mb-6 animate-in fade-in zoom-in-75 duration-500">
              <HeartIcon className="size-7 text-muted-foreground" />
            </div>

            {couple.isCouple && couple.coupleSecret ? (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                <p className="text-foreground text-center text-sm font-light tracking-wide mb-1.5">
                  Your gallery is ready for memories
                </p>
                <p className="text-muted-foreground/60 text-center text-xs tracking-wide max-w-[240px] mb-6">
                  Share the link with your guests so they can start capturing
                  moments
                </p>
                <EventShareDialog
                  slug={slug}
                  coupleSecret={couple.coupleSecret}
                  className="size-auto rounded-full px-4 py-2 bg-foreground/5 hover:bg-foreground/10"
                >
                  <Share2Icon className="size-3.5" />
                  <span className="text-xs tracking-wide">Invite guests</span>
                </EventShareDialog>
              </div>
            ) : (
              <div className="relative flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                <p className="text-foreground text-center text-sm font-light tracking-wide mb-1.5">
                  Every love story deserves great photos
                </p>
                <p className="text-muted-foreground/60 text-center text-xs tracking-wide max-w-[220px] mb-8">
                  Tap the camera below to capture the first moment
                </p>
                <div className="animate-bounce-subtle text-purple-500/60">
                  <svg
                    width="32"
                    height="48"
                    viewBox="0 0 32 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="rotate-[25deg]"
                  >
                    <path
                      d="M8 4C8 4 4 20 12 32C18 40 26 42 28 44"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M22 40L28 44L24 38"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-3 gap-0.5"
                : "flex flex-col gap-2 max-w-lg mx-auto",
            )}
          >
            {photos.map((photo, index) =>
              photo.url ? (
                <div
                  key={photo._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePhotoClick(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePhotoClick(index);
                    }
                  }}
                  className={cn(
                    "relative overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
                    viewMode === "grid" ? "aspect-square" : "rounded-sm",
                  )}
                >
                  {viewMode === "grid" ? (
                    <Image
                      src={photo.url}
                      alt=""
                      fill
                      sizes="33vw"
                      className={cn(
                        "object-cover",
                        couple.isCouple && !photo.isPublic && "opacity-50",
                      )}
                    />
                  ) : (
                    <Image
                      src={photo.url}
                      alt=""
                      width={600}
                      height={600}
                      sizes="(max-width: 512px) 100vw, 512px"
                      className={cn(
                        "w-full h-auto",
                        couple.isCouple && !photo.isPublic && "opacity-50",
                      )}
                    />
                  )}
                  {couple.isCouple && !photo.isPublic && (
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                  )}
                  {couple.isCouple && couple.coupleSecret && (
                    <VisibilityToggle
                      photoId={photo._id}
                      eventId={event._id}
                      coupleSecret={couple.coupleSecret}
                      isPublic={photo.isPublic}
                    />
                  )}
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      {hasPhotos && (
        <PhotoLightbox
          photos={photos}
          selectedIndex={selectedPhotoIndex}
          onClose={handleLightboxClose}
          onNavigate={setSelectedPhotoIndex}
          eventId={event._id}
          couple={
            couple.isCouple && couple.coupleSecret
              ? {
                  isCouple: true,
                  coupleSecret: couple.coupleSecret,
                  eventId: event._id,
                }
              : undefined
          }
          guest={
            guest.guestId
              ? {
                  guestId: guest.guestId,
                  deviceId: guest.deviceId,
                }
              : undefined
          }
        />
      )}

      {/* Camera FAB — hidden when lightbox is open */}
      {selectedPhotoIndex === null && (
        <Link
          href={`/e/${slug}/camera`}
          className="fixed bottom-6 right-6 z-10 flex items-center justify-center size-14 rounded-full bg-linear-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25 transition-transform active:scale-95"
          aria-label="Take a photo"
        >
          <CameraIcon className="size-6 text-white" />
        </Link>
      )}

      {/* Edit Event Drawer (couple only) */}
      {couple.isCouple && couple.coupleSecret && (
        <EventEditDrawer
          open={editOpen}
          onOpenChange={setEditOpen}
          eventId={event._id}
          coupleSecret={couple.coupleSecret}
          name={event.name}
          date={event.date}
          coverPhotoUrl={event.coverPhotoUrl}
        />
      )}
    </div>
  );
}
