import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import * as Reactions from "./reactions";

export async function createPhoto(
  ctx: MutationCtx,
  args: {
    eventId: Id<"events">;
    guestId?: Id<"guests">;
    storageId: Id<"_storage">;
  },
): Promise<Id<"photos">> {
  return ctx.db.insert("photos", {
    eventId: args.eventId,
    guestId: args.guestId,
    storageId: args.storageId,
    isPublic: true,
    createdAt: Date.now(),
  });
}

export async function getEventPhotos(ctx: QueryCtx, eventId: Id<"events">) {
  const photos = await ctx.db
    .query("photos")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .order("desc")
    .collect();

  return Promise.all(
    photos.map(async (photo) => {
      const url = await ctx.storage.getUrl(photo.storageId);
      return { ...photo, url };
    }),
  );
}

export async function getPublicEventPhotos(
  ctx: QueryCtx,
  eventId: Id<"events">,
) {
  const photos = await ctx.db
    .query("photos")
    .withIndex("by_event_public", (q) =>
      q.eq("eventId", eventId).eq("isPublic", true),
    )
    .order("desc")
    .collect();

  return Promise.all(
    photos.map(async (photo) => {
      const url = await ctx.storage.getUrl(photo.storageId);
      return { ...photo, url };
    }),
  );
}

export async function deletePhoto(
  ctx: MutationCtx,
  photoId: Id<"photos">,
  eventId: Id<"events">,
): Promise<void> {
  const photo = await ctx.db.get(photoId);
  if (!photo) {
    throw new ConvexError({ code: "NotFound", message: "Photo not found" });
  }
  if (photo.eventId !== eventId) {
    throw new ConvexError({
      code: "Forbidden",
      message: "Photo does not belong to this event",
    });
  }

  try {
    await ctx.storage.delete(photo.storageId);
  } catch {
    // Storage file might already be deleted - continue anyway
  }
  await ctx.db.delete(photoId);
  await Reactions.deletePhotoReactions(ctx, photoId);
}

export async function getAllPhotoCount(
  ctx: QueryCtx,
  eventId: Id<"events">,
): Promise<number> {
  const photos = await ctx.db
    .query("photos")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();
  return photos.length;
}

export async function getLatestActivityAt(
  ctx: QueryCtx,
  eventId: Id<"events">,
): Promise<number | null> {
  const photo = await ctx.db
    .query("photos")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .order("desc")
    .first();
  return photo?.createdAt ?? null;
}

export async function getPublicPhotoCount(
  ctx: QueryCtx,
  eventId: Id<"events">,
): Promise<number> {
  const photos = await ctx.db
    .query("photos")
    .withIndex("by_event_public", (q) =>
      q.eq("eventId", eventId).eq("isPublic", true),
    )
    .collect();
  return photos.length;
}

export async function getLatestPublicPhotoUrl(
  ctx: QueryCtx,
  eventId: Id<"events">,
): Promise<string | null> {
  const photo = await ctx.db
    .query("photos")
    .withIndex("by_event_public", (q) =>
      q.eq("eventId", eventId).eq("isPublic", true),
    )
    .order("desc")
    .first();
  if (!photo) return null;
  return ctx.storage.getUrl(photo.storageId);
}

export async function updatePhotoCaption(
  ctx: MutationCtx,
  photoId: Id<"photos">,
  caption: string | undefined,
): Promise<void> {
  const photo = await ctx.db.get(photoId);
  if (!photo) {
    throw new ConvexError({ code: "NotFound", message: "Photo not found" });
  }
  await ctx.db.patch(photoId, { caption: caption || undefined });
}

export async function togglePhotoVisibility(
  ctx: MutationCtx,
  photoId: Id<"photos">,
): Promise<boolean> {
  const photo = await ctx.db.get(photoId);
  if (!photo) {
    throw new ConvexError({ code: "NotFound", message: "Photo not found" });
  }

  const newValue = !photo.isPublic;
  await ctx.db.patch(photoId, { isPublic: newValue });
  return newValue;
}
