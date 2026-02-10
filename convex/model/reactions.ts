import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export type Emoji = "heart" | "fire" | "laugh" | "cry" | "clap";

export async function toggleReaction(
  ctx: MutationCtx,
  args: {
    photoId: Id<"photos">;
    eventId: Id<"events">;
    deviceId: string;
    emoji: Emoji;
  },
): Promise<{ action: "added" | "removed" | "changed" }> {
  const existing = await ctx.db
    .query("reactions")
    .withIndex("by_photo_device", (q) =>
      q.eq("photoId", args.photoId).eq("deviceId", args.deviceId),
    )
    .first();

  if (existing) {
    if (existing.emoji === args.emoji) {
      await ctx.db.delete(existing._id);
      return { action: "removed" };
    }
    await ctx.db.patch(existing._id, { emoji: args.emoji });
    return { action: "changed" };
  }

  await ctx.db.insert("reactions", {
    photoId: args.photoId,
    eventId: args.eventId,
    deviceId: args.deviceId,
    emoji: args.emoji,
    createdAt: Date.now(),
  });
  return { action: "added" };
}

export async function getPhotoReactions(
  ctx: QueryCtx,
  photoId: Id<"photos">,
) {
  return ctx.db
    .query("reactions")
    .withIndex("by_photo", (q) => q.eq("photoId", photoId))
    .collect();
}

export async function getEventReactionCounts(
  ctx: QueryCtx,
  eventId: Id<"events">,
) {
  const reactions = await ctx.db
    .query("reactions")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();

  const counts: Record<
    string,
    Record<Emoji, number> & { total: number }
  > = {};

  for (const r of reactions) {
    const photoId = r.photoId as string;
    if (!counts[photoId]) {
      counts[photoId] = { heart: 0, fire: 0, laugh: 0, cry: 0, clap: 0, total: 0 };
    }
    counts[photoId][r.emoji] += 1;
    counts[photoId].total += 1;
  }

  return counts;
}

export async function deletePhotoReactions(
  ctx: MutationCtx,
  photoId: Id<"photos">,
): Promise<void> {
  const reactions = await ctx.db
    .query("reactions")
    .withIndex("by_photo", (q) => q.eq("photoId", photoId))
    .collect();
  await Promise.all(reactions.map((r) => ctx.db.delete(r._id)));
}

export async function deleteEventReactions(
  ctx: MutationCtx,
  eventId: Id<"events">,
): Promise<void> {
  const reactions = await ctx.db
    .query("reactions")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();
  await Promise.all(reactions.map((r) => ctx.db.delete(r._id)));
}
