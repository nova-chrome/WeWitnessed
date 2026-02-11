"use client";

import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { CameraIcon, ChevronRightIcon, UsersIcon } from "lucide-react";
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
import { cn } from "~/lib/utils";

interface GuestListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: Id<"events">;
  coupleSecret: string;
  slug: string;
}

export function GuestListDrawer({
  open,
  onOpenChange,
  eventId,
  coupleSecret,
  slug,
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
                <Skeleton key={i} className="h-14 rounded-lg" />
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
              {guests.map((guest) => (
                <Link
                  key={guest._id}
                  href={`/e/${slug}?guest=${guest._id}`}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 transition-colors hover:bg-foreground/5",
                    guest.photoCount === 0 && "opacity-60",
                  )}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm text-foreground truncate">
                      {guest.name}
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      {guest.latestPhotoAt
                        ? `Last photo ${formatDistanceToNow(guest.latestPhotoAt, { addSuffix: true })}`
                        : `Joined ${formatDistanceToNow(guest.createdAt, { addSuffix: true })}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CameraIcon className="size-3" />
                      {guest.photoCount}
                    </span>
                    <ChevronRightIcon className="size-4 text-muted-foreground/40" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
