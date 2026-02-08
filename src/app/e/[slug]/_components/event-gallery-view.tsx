"use client";

import { useQuery } from "convex/react";
import { CameraIcon, KeyRoundIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "~/components/theme-toggle";
import { api } from "~/convex/_generated/api";
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

        <div className="relative flex flex-col items-center justify-center min-h-svh px-6">
          <div className="animate-spin text-4xl text-muted-foreground">
            &#9670;
          </div>
          <p className="text-muted-foreground text-center text-sm mt-4">
            Loading...
          </p>
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
          <h1 className="text-xl font-light text-foreground tracking-tight">
            {event.name}
          </h1>
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
        {!hasPhotos ? (
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="flex items-center justify-center size-16 rounded-full bg-muted mb-4">
              <CameraIcon className="size-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center text-sm tracking-wide mb-1">
              No photos yet
            </p>
            <p className="text-muted-foreground/60 text-center text-xs tracking-wide">
              Be the first to capture a moment!
            </p>
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
                    viewMode === "grid"
                      ? "aspect-square"
                      : "rounded-sm",
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
    </div>
  );
}

