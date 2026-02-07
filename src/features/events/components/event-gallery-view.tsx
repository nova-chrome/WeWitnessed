"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface EventGalleryViewProps {
  slug: string;
}

export function EventGalleryView({ slug }: EventGalleryViewProps) {
  const event = useQuery(api.events.getBySlug, { slug });

  if (event === undefined) {
    return (
      <div className="relative min-h-svh bg-neutral-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-neutral-900 via-neutral-950 to-black pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center min-h-svh px-6">
          <div className="animate-spin text-4xl text-neutral-400">◆</div>
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

  return (
    <div className="relative min-h-svh bg-neutral-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-neutral-900 via-neutral-950 to-black pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center min-h-svh px-6">
        <div className="text-5xl font-light text-neutral-100 tracking-tight mb-8">
          W
        </div>
        <h1 className="text-2xl font-light text-neutral-100 tracking-tight mb-2">
          {event.name}
        </h1>
        <p className="text-neutral-400 text-center text-sm tracking-wide">
          Gallery — coming soon.
        </p>
      </div>
    </div>
  );
}
