"use client";

import { useQuery } from "convex/react";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CameraIcon,
  EyeOffIcon,
  ImageIcon,
  KeyRoundIcon,
  LinkIcon,
  PencilIcon,
  Share2Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/convex/_generated/api";
import { EventDeleteDialog } from "~/features/events/components/event-delete-dialog";
import { EventEditDrawer } from "~/features/events/components/event-edit-drawer";
import { EventShareDialog } from "~/features/events/components/event-share-dialog";
import { useCoupleSession } from "~/features/events/hooks/use-couple-session";
import { cn } from "~/lib/utils";
import { GuestListDrawer } from "./guest-list-drawer";

interface ManageDashboardProps {
  slug: string;
}

export function ManageDashboard({ slug }: ManageDashboardProps) {
  const event = useQuery(api.events.getBySlug, { slug });
  const couple = useCoupleSession(slug, event?._id);

  const stats = useQuery(
    api.events.getStats,
    event && couple.coupleSecret
      ? { eventId: event._id, coupleSecret: couple.coupleSecret }
      : "skip",
  );

  const [editOpen, setEditOpen] = useState(false);
  const [guestDrawerOpen, setGuestDrawerOpen] = useState(false);

  // Loading state
  if (event === undefined || couple.isLoading) {
    return <DashboardSkeleton />;
  }

  // Event not found
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

  // Unauthorized — not a couple
  if (!couple.isCouple || !couple.coupleSecret) {
    return (
      <div className="relative min-h-svh bg-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-muted via-background to-background pointer-events-none" />
        <div className="relative flex flex-col items-center justify-center min-h-svh px-6">
          <div className="text-5xl font-light text-foreground tracking-tight mb-8">
            W
          </div>
          <KeyRoundIcon className="size-8 text-muted-foreground mb-4" />
          <p className="text-foreground text-center text-sm font-light tracking-wide mb-2">
            Couple access required
          </p>
          <p className="text-muted-foreground/60 text-center text-xs tracking-wide max-w-[240px] mb-6">
            You need the couple link to manage this event.
          </p>
          <Link
            href={`/e/${slug}`}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors tracking-wide"
          >
            Back to gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-svh bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-muted via-background to-background pointer-events-none" />

      {/* Header */}
      <div className="relative pt-safe-or-4 px-4 pb-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/e/${slug}`}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs tracking-wide"
          >
            <ArrowLeftIcon className="size-3.5" />
            Gallery
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center gap-1 pt-2">
          <div className="text-3xl font-light text-foreground tracking-tight">
            W
          </div>
          <h1 className="text-xl font-light text-foreground tracking-tight">
            {event.name}
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-400 tracking-wide">
            <KeyRoundIcon className="size-3" />
            Manage
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-4 pb-safe-or-8 max-w-lg mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon={<ImageIcon className="size-4" />}
            value={stats?.totalPhotos}
            label="Photos"
          />
          <StatCard
            icon={<UsersIcon className="size-4" />}
            value={stats?.guestCount}
            label="Guests"
            onClick={() => setGuestDrawerOpen(true)}
          />
          <StatCard
            icon={<CameraIcon className="size-4" />}
            value={
              stats?.latestActivityAt
                ? formatDistanceToNow(stats.latestActivityAt, {
                    addSuffix: true,
                  })
                : null
            }
            label="Last upload"
          />
        </div>

        {/* Hidden photos note */}
        {stats && stats.hiddenPhotos > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <EyeOffIcon className="size-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              {stats.hiddenPhotos} hidden{" "}
              {stats.hiddenPhotos === 1 ? "photo" : "photos"} (only visible to
              you)
            </p>
          </div>
        )}

        {/* Event Details */}
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-xs tracking-wider uppercase">
            Event Details
          </h2>
          <div className="rounded-lg border border-border bg-card/50 divide-y divide-border">
            <DetailRow label="Name" value={event.name} />
            {event.date && (
              <DetailRow
                label="Date"
                value={format(event.date, "PPPP")}
                icon={<CalendarIcon className="size-3.5" />}
              />
            )}
            <DetailRow
              label="Link"
              value={`/e/${event.slug}`}
              icon={<LinkIcon className="size-3.5" />}
            />
            <DetailRow
              label="Created"
              value={format(event.createdAt, "PPP")}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-xs tracking-wider uppercase">
            Actions
          </h2>
          <div className="flex flex-col gap-2">
            <EventShareDialog
              slug={slug}
              coupleSecret={couple.coupleSecret}
              className="w-full h-11 rounded-lg bg-card/50 border border-border hover:bg-foreground/5 justify-start px-4 gap-3"
            >
              <Share2Icon className="size-4 text-muted-foreground" />
              <span className="text-sm">Share event</span>
            </EventShareDialog>

            <Button
              variant="outline"
              className="w-full h-11 justify-start px-4 gap-3 bg-card/50 hover:bg-foreground/5"
              onClick={() => setEditOpen(true)}
            >
              <PencilIcon className="size-4 text-muted-foreground" />
              <span className="text-sm">Edit event</span>
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-xs tracking-wider uppercase">
            Danger Zone
          </h2>
          <EventDeleteDialog
            eventId={event._id}
            coupleSecret={couple.coupleSecret}
          />
        </section>
      </div>

      {/* Guest List Drawer */}
      <GuestListDrawer
        open={guestDrawerOpen}
        onOpenChange={setGuestDrawerOpen}
        eventId={event._id}
        eventSlug={slug}
        coupleSecret={couple.coupleSecret}
      />

      {/* Edit Event Drawer */}
      <EventEditDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        eventId={event._id}
        coupleSecret={couple.coupleSecret}
        name={event.name}
        date={event.date}
        coverPhotoUrl={event.coverPhotoUrl}
      />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  value: number | string | null | undefined;
  label: string;
  onClick?: () => void;
}) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card/50 p-3",
        onClick && "cursor-pointer hover:bg-foreground/5 transition-colors",
      )}
    >
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex items-center justify-center min-h-7">
        {value === undefined ? (
          <Skeleton className="h-5 w-8 rounded" />
        ) : (
          <span
            className={cn(
              "font-medium text-foreground",
              typeof value === "string" ? "text-xs text-center" : "text-lg",
            )}
          >
            {value ?? "--"}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-muted-foreground/60 text-[10px] tracking-wider uppercase",
          onClick && "underline underline-offset-2",
        )}
      >
        {label}
      </span>
    </Component>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-sm text-foreground">
        {icon}
        {value}
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="relative min-h-svh bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-muted via-background to-background pointer-events-none" />

      <div className="relative pt-safe-or-4 px-4 pb-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="flex flex-col items-center gap-1 pt-2">
          <div className="text-3xl font-light text-foreground tracking-tight">
            W
          </div>
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>

      <div className="relative px-4 max-w-lg mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}
