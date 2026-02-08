"use client";

import { useMutation, useQuery } from "convex/react";
import {
  CameraIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { ThemeToggle } from "~/components/theme-toggle";
import { cn } from "~/lib/utils";
import { useCoupleSession } from "~/features/events/hooks/use-couple-session";

interface EventGalleryViewProps {
  slug: string;
}

export function EventGalleryView({ slug }: EventGalleryViewProps) {
  const event = useQuery(api.events.getBySlug, { slug });
  const couple = useCoupleSession(slug, event?._id);

  const photos = useQuery(
    api.photos.getByEvent,
    event
      ? {
          eventId: event._id,
          ...(couple.coupleSecret ? { coupleSecret: couple.coupleSecret } : {}),
        }
      : "skip",
  );

  if (event === undefined) {
    return (
      <div className="relative min-h-svh bg-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-muted via-background to-background pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center min-h-svh px-6">
          <div className="animate-spin text-4xl text-muted-foreground">&#9670;</div>
          <p className="text-muted-foreground text-center text-sm mt-4">Loading...</p>
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
        {/* Theme toggle */}
        <div className="absolute top-4 right-4 z-10">
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
          <div className="grid grid-cols-3 gap-0.5">
            {photos.map((photo) =>
              photo.url ? (
                <div
                  key={photo._id}
                  className="relative aspect-square overflow-hidden"
                >
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

      {/* Camera FAB */}
      <Link
        href={`/e/${slug}/camera`}
        className="fixed bottom-6 right-6 z-10 flex items-center justify-center size-14 rounded-full bg-linear-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25 transition-transform active:scale-95"
        aria-label="Take a photo"
      >
        <CameraIcon className="size-6 text-white" />
      </Link>
    </div>
  );
}

function VisibilityToggle({
  photoId,
  eventId,
  coupleSecret,
  isPublic,
}: {
  photoId: Id<"photos">;
  eventId: Id<"events">;
  coupleSecret: string;
  isPublic: boolean;
}) {
  const toggleVisibility = useMutation(api.photos.toggleVisibility);

  async function handleToggle() {
    await toggleVisibility({ photoId, eventId, coupleSecret });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "absolute top-2 right-2 z-10 flex items-center justify-center",
        "size-8 rounded-full backdrop-blur-md transition-all active:scale-90",
        isPublic ? "bg-white/20 text-white" : "bg-black/60 text-muted-foreground",
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
