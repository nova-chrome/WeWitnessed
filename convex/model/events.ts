import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import * as Reactions from "./reactions";

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => SLUG_CHARS[byte % SLUG_CHARS.length]).join(
    "",
  );
}

export async function generateUniqueSlug(ctx: MutationCtx): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const slug = generateRandomString(10);
    const existing = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!existing) return slug;
  }
  throw new ConvexError({
    code: "Internal",
    message: "Failed to generate unique slug",
  });
}

export function generateCoupleSecret(): string {
  return generateRandomString(32);
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export async function resolveSlug(
  ctx: MutationCtx,
  customSlug?: string,
): Promise<string> {
  if (!customSlug) return generateUniqueSlug(ctx);

  const slug = customSlug.toLowerCase().trim();

  if (slug.length < 3 || slug.length > 40) {
    throw new ConvexError({
      code: "BadRequest",
      message: "Slug must be between 3 and 40 characters",
    });
  }

  if (!SLUG_PATTERN.test(slug)) {
    throw new ConvexError({
      code: "BadRequest",
      message:
        "Slug can only contain lowercase letters, numbers, and hyphens (no leading/trailing hyphens)",
    });
  }

  const existing = await ctx.db
    .query("events")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();

  if (existing) {
    throw new ConvexError({
      code: "Conflict",
      message: "This URL is already taken",
    });
  }

  return slug;
}

export function resolveCoupleSecret(customSecret?: string): string {
  if (!customSecret) return generateCoupleSecret();

  const secret = customSecret.toLowerCase().trim();

  if (secret.length < 3 || secret.length > 40) {
    throw new ConvexError({
      code: "BadRequest",
      message: "Secret must be between 3 and 40 characters",
    });
  }

  if (!SLUG_PATTERN.test(secret)) {
    throw new ConvexError({
      code: "BadRequest",
      message:
        "Secret can only contain lowercase letters, numbers, and hyphens (no leading/trailing hyphens)",
    });
  }

  return secret;
}

export async function getEventBySlug(ctx: QueryCtx, slug: string) {
  return ctx.db
    .query("events")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
}

export async function verifyCoupleSecret(
  ctx: QueryCtx,
  eventId: Id<"events">,
  coupleSecret: string,
): Promise<boolean> {
  const event = await ctx.db.get(eventId);
  if (!event) return false;
  return event.coupleSecret === coupleSecret;
}

export async function updateEvent(
  ctx: MutationCtx,
  eventId: Id<"events">,
  coupleSecret: string,
  fields: { name?: string; date?: number },
): Promise<void> {
  const isValid = await verifyCoupleSecret(ctx, eventId, coupleSecret);
  if (!isValid) {
    throw new ConvexError({
      code: "Forbidden",
      message: "Invalid couple secret",
    });
  }

  const patch: Record<string, string | number | undefined> = {};
  if (fields.name !== undefined) patch.name = fields.name;
  if (fields.date !== undefined) patch.date = fields.date;

  if (Object.keys(patch).length === 0) return;

  await ctx.db.patch(eventId, patch);
}

export async function setCoverPhoto(
  ctx: MutationCtx,
  eventId: Id<"events">,
  coupleSecret: string,
  storageId: Id<"_storage">,
): Promise<void> {
  const isValid = await verifyCoupleSecret(ctx, eventId, coupleSecret);
  if (!isValid) {
    throw new ConvexError({
      code: "Forbidden",
      message: "Invalid couple secret",
    });
  }

  const event = await ctx.db.get(eventId);
  if (event?.coverPhotoStorageId) {
    try {
      await ctx.storage.delete(event.coverPhotoStorageId);
    } catch {
      // Storage file might already be deleted - continue anyway
    }
  }

  await ctx.db.patch(eventId, { coverPhotoStorageId: storageId });
}

export async function removeCoverPhoto(
  ctx: MutationCtx,
  eventId: Id<"events">,
  coupleSecret: string,
): Promise<void> {
  const isValid = await verifyCoupleSecret(ctx, eventId, coupleSecret);
  if (!isValid) {
    throw new ConvexError({
      code: "Forbidden",
      message: "Invalid couple secret",
    });
  }

  const event = await ctx.db.get(eventId);
  if (event?.coverPhotoStorageId) {
    try {
      await ctx.storage.delete(event.coverPhotoStorageId);
    } catch {
      // Storage file might already be deleted - continue anyway
    }
    await ctx.db.patch(eventId, { coverPhotoStorageId: undefined });
  }
}

export async function deleteEvent(
  ctx: MutationCtx,
  eventId: Id<"events">,
  coupleSecret: string,
): Promise<void> {
  const isValid = await verifyCoupleSecret(ctx, eventId, coupleSecret);
  if (!isValid) {
    throw new ConvexError({
      code: "Forbidden",
      message: "Invalid couple secret",
    });
  }

  // Delete all photos (storage files + DB records)
  const photos = await ctx.db
    .query("photos")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();

  await Promise.all(
    photos.map(async (photo) => {
      try {
        await ctx.storage.delete(photo.storageId);
      } catch {
        // Storage file might already be deleted - continue anyway
      }
      await ctx.db.delete(photo._id);
    }),
  );

  // Delete all guests
  const guests = await ctx.db
    .query("guests")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();

  await Promise.all(guests.map((guest) => ctx.db.delete(guest._id)));

  // Delete all reactions
  await Reactions.deleteEventReactions(ctx, eventId);

  // Delete the event itself
  await ctx.db.delete(eventId);
}
