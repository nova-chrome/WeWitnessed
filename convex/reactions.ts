import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Reactions from "./model/reactions";

const emojiValidator = v.union(
  v.literal("heart"),
  v.literal("fire"),
  v.literal("laugh"),
  v.literal("cry"),
  v.literal("clap"),
);

export const toggle = mutation({
  args: {
    photoId: v.id("photos"),
    eventId: v.id("events"),
    deviceId: v.string(),
    emoji: emojiValidator,
  },
  returns: v.object({
    action: v.union(
      v.literal("added"),
      v.literal("removed"),
      v.literal("changed"),
    ),
  }),
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.photoId);
    if (!photo || photo.eventId !== args.eventId) {
      throw new ConvexError({
        code: "NotFound",
        message: "Photo not found",
      });
    }
    return Reactions.toggleReaction(ctx, args);
  },
});

export const getByPhoto = query({
  args: {
    photoId: v.id("photos"),
    deviceId: v.optional(v.string()),
  },
  returns: v.object({
    counts: v.object({
      heart: v.number(),
      fire: v.number(),
      laugh: v.number(),
      cry: v.number(),
      clap: v.number(),
      total: v.number(),
    }),
    userEmoji: v.union(emojiValidator, v.null()),
  }),
  handler: async (ctx, { photoId, deviceId }) => {
    const reactions = await Reactions.getPhotoReactions(ctx, photoId);

    const counts = { heart: 0, fire: 0, laugh: 0, cry: 0, clap: 0, total: 0 };
    let userEmoji: "heart" | "fire" | "laugh" | "cry" | "clap" | null = null;

    for (const r of reactions) {
      counts[r.emoji] += 1;
      counts.total += 1;
      if (deviceId && r.deviceId === deviceId) {
        userEmoji = r.emoji;
      }
    }

    return { counts, userEmoji };
  },
});

export const getCountsByEvent = query({
  args: {
    eventId: v.id("events"),
  },
  returns: v.any(),
  handler: async (ctx, { eventId }) => {
    return Reactions.getEventReactionCounts(ctx, eventId);
  },
});
