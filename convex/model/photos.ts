import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

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
