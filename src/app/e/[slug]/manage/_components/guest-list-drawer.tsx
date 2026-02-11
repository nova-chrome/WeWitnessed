"use client";

import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { ChevronRightIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface GuestListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: Id<"events">;
  eventSlug: string;
  coupleSecret: string;
}

export function GuestListDrawer({
  open,
  onOpenChange,
  eventId,
  eventSlug,
  coupleSecret,
}: GuestListDrawerProps) {
  const guests = useQuery(
    api.guests.listByEvent,
    open ? { eventId, coupleSecret } : "skip",
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-base font-light tracking-wide">
            Guests
          </DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground/80">
            Everyone who joined your event
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-safe-or-6">
          {guests === undefined ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : guests === null || guests.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <UsersIcon className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No guests yet</p>
              <p className="text-xs text-muted-foreground/60">
                Guests will appear here once they join and upload photos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border bg-card/50">
              {guests.map((guest) => {
                const hasPhotos = guest.photoCount > 0;
                const galleryUrl = `/e/${eventSlug}?guest=${guest._id}`;

                return (
                  <div
                    key={guest._id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-sm text-foreground">
                        {guest.name}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        {hasPhotos && guest.latestPhotoAt ? (
                          <>
                            {guest.photoCount}{" "}
                            {guest.photoCount === 1 ? "photo" : "photos"} •
                            last active{" "}
                            {formatDistanceToNow(guest.latestPhotoAt, {
                              addSuffix: true,
                            })}
                          </>
                        ) : (
                          <>
                            joined{" "}
                            {formatDistanceToNow(guest.createdAt, {
                              addSuffix: true,
                            })}
                          </>
                        )}
                      </span>
                    </div>

                    {hasPhotos && (
                      <Link
                        href={galleryUrl}
                        className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => onOpenChange(false)}
                      >
                        View photos
                        <ChevronRightIcon className="size-3.5" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
