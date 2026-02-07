"use client";

import { useQuery } from "convex/react";
import { CameraIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";

interface EventGalleryViewProps {
  slug: string;
}

export function EventGalleryView({ slug }: EventGalleryViewProps) {
  const event = useQuery(api.events.getBySlug, { slug });
  const photos = useQuery(
    api.photos.getByEvent,
    event ? { eventId: event._id } : "skip",
  );

  if (event === undefined) {
    return (
      <div className="relative min-h-svh bg-neutral-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-neutral-900 via-neutral-950 to-black pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center min-h-svh px-6">
          <div className="animate-spin text-4xl text-neutral-400">&#9670;</div>
          <p className="text-neutral-500 text-center text-sm mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="relative min-h-svh bg-neutral-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-neutral-900 via-neutral-950 to-black pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center min-h-svh px-6">
          <div className="text-5xl font-light text-neutral-100 tracking-tight mb-8">
            W
          </div>
          <p className="text-neutral-400 text-center text-sm tracking-wide">
            Event not found. Check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  const hasPhotos = photos && photos.length > 0;

  return (
    <div className="relative min-h-svh bg-neutral-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-neutral-900 via-neutral-950 to-black pointer-events-none" />

      {/* Header */}
      <div className="relative pt-safe-or-4 px-4 pb-4">
        <div className="flex flex-col items-center gap-1 pt-4">
          <div className="text-3xl font-light text-neutral-100 tracking-tight">
            W
          </div>
          <h1 className="text-xl font-light text-neutral-100 tracking-tight">
            {event.name}
          </h1>
          {hasPhotos && (
            <p className="text-neutral-500 text-xs tracking-wide">
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </p>
          )}
        </div>
      </div>

      {/* Gallery content */}
      <div className="relative px-2 pb-24">
        {!hasPhotos ? (
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="flex items-center justify-center size-16 rounded-full bg-neutral-900 mb-4">
              <CameraIcon className="size-7 text-neutral-500" />
            </div>
            <p className="text-neutral-400 text-center text-sm tracking-wide mb-1">
              No photos yet
            </p>
            <p className="text-neutral-500 text-center text-xs tracking-wide">
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
                    className="object-cover"
                  />
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
