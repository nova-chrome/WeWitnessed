"use client";

import { useQuery } from "convex/react";
import {
  CameraIcon,
  HeartIcon,
  ImageIcon,
  KeyRoundIcon,
  SettingsIcon,
  PencilIcon,
  Share2Icon,
} from "lucide-react";
import Image from "next/image";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { useQueryState, parseAsString } from "nuqs";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "~/components/theme-toggle";
import { api } from "~/convex/_generated/api";
import { EventEditDrawer } from "~/features/events/components/event-edit-drawer";
import { EventShareDialog } from "~/features/events/components/event-share-dialog";
import { useCoupleSession } from "~/features/events/hooks/use-couple-session";
import { GuestNameDialog } from "~/features/guests/components/guest-name-dialog";
import { useGuestSession } from "~/features/guests/hooks/use-guest-session";
import { PhotoLightbox } from "~/features/photos/components/photo-lightbox";
import { usePhotoUpload } from "~/features/photos/hooks/use-photo-upload";
import { VisibilityToggle } from "~/features/photos/components/visibility-toggle";
import { ReactionBadge } from "~/features/reactions/components/reaction-badge";
import { ReactionBar } from "~/features/reactions/components/reaction-bar";
import { cn } from "~/lib/utils";
import { tryCatch } from "~/utils/try-catch";
import type { ViewMode } from "~/features/gallery/components/view-toggle";
import { ViewToggle } from "~/features/gallery/components/view-toggle";

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

  const reactionCounts = useQuery(
    api.reactions.getCountsByEvent,
    event ? { eventId: event._id } : "skip",
  );

  const { upload, isUploading } = usePhotoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [photoId, setPhotoId] = useQueryState(
    "photo",
    parseAsString.withOptions({ history: "replace" }),
  );
  const [editOpen, setEditOpen] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const selectedPhotoIndex = useMemo(() => {
    if (!photoId || !photos) return null;
    const index = photos.findIndex((p) => p._id === photoId);
    if (index === -1) {
      setPhotoId(null);
      return null;
    }
    return index;
  }, [photoId, photos, setPhotoId]);

  function handlePhotoClick(index: number) {
    if (photos) setPhotoId(photos[index]._id);
  }

  function handleLightboxClose() {
    setPhotoId(null);
  }

  function toggleViewMode() {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  }

  const uploadFiles = useCallback(
    async (files: File[], guestId: string | null) => {
      if (!event) return;

      let failed = 0;
      for (const file of files) {
        const { error } = await tryCatch(
          upload(
            event._id,
            guestId as Parameters<typeof upload>[1],
            file,
          ),
        );
        if (error) failed++;
      }

      if (failed > 0) {
        toast.error(`${failed} ${failed === 1 ? "photo" : "photos"} failed to upload.`);
      }
      const succeeded = files.length - failed;
      if (succeeded > 0) {
        toast.success(
          succeeded === 1
            ? "Photo uploaded!"
            : `${succeeded} photos uploaded!`,
        );
      }
    },
    [event, upload],
  );

  const handleFilesSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = "";
      if (files.length === 0) return;

      if (!guest.guestId) {
        setPendingFiles(files);
        setShowNamePrompt(true);
        return;
      }

      uploadFiles(files, guest.guestId);
    },
    [guest.guestId, uploadFiles],
  );

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
        {/* Couple controls */}
        {couple.isCouple && couple.coupleSecret && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1">
            <EventShareDialog slug={slug} coupleSecret={couple.coupleSecret} />
            <Link
              href={`/e/${slug}/manage`}
              className="inline-flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Manage event"
            >
              <SettingsIcon className="size-4" />
            </Link>
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
                  Tap the camera below to capture a moment, or upload photos
                  from your library
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
                    <>
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
                      {(() => {
                        const counts = (reactionCounts as Record<string, { total: number }> | undefined)?.[photo._id];
                        return counts?.total ? <ReactionBadge total={counts.total} /> : null;
                      })()}
                    </>
                  ) : (
                    <>
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
                      {photo.caption && (
                        <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-3 pb-2.5 pt-6 text-sm text-white/80">
                          {photo.caption}
                        </p>
                      )}
                      <div className="flex justify-center py-2">
                        <ReactionBar
                          photoId={photo._id}
                          eventId={event._id}
                          deviceId={guest.deviceId}
                        />
                      </div>
                    </>
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
          onNavigate={(index) => {
            if (photos) setPhotoId(photos[index]._id);
          }}
          eventId={event._id}
          deviceId={guest.deviceId}
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

      {/* Hidden file input for photo library upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* FABs — hidden when lightbox is open */}
      {selectedPhotoIndex === null && (
        <div className="fixed bottom-6 right-6 z-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center justify-center size-11 rounded-full bg-background/80 backdrop-blur border border-border shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            aria-label="Upload from photo library"
          >
            <ImageIcon className="size-5 text-foreground" />
          </button>
          <Link
            href={`/e/${slug}/camera`}
            className="flex items-center justify-center size-14 rounded-full bg-linear-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25 transition-transform active:scale-95"
            aria-label="Take a photo"
          >
            <CameraIcon className="size-6 text-white" />
          </Link>
        </div>
      )}

      {/* Guest name prompt for photo library uploads */}
      <GuestNameDialog
        open={showNamePrompt}
        createGuest={guest.createGuest}
        onComplete={async (resolvedGuestId) => {
          setShowNamePrompt(false);
          await uploadFiles(pendingFiles, resolvedGuestId);
          setPendingFiles([]);
        }}
        onClose={() => {
          setShowNamePrompt(false);
          setPendingFiles([]);
        }}
      />

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
